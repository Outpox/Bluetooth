import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'py_modules'))

import decky
from jeepney import DBusAddress, Properties, new_method_call
from jeepney.io.asyncio import open_dbus_router
from jeepney.wrappers import unwrap_msg

BLUEZ_SERVICE = 'org.bluez'
OBJECT_MANAGER_IFACE = 'org.freedesktop.DBus.ObjectManager'
ADAPTER_IFACE = 'org.bluez.Adapter1'
DEVICE_IFACE = 'org.bluez.Device1'
BATTERY_IFACE = 'org.bluez.Battery1'

POWER_SUPPLY_PATH = '/sys/class/power_supply'

# Set on the first successful discovery. BlueZ keeps the same path for the life
# of the adapter, so one lookup covers the session.
_adapter_path = None

DEBUG = False  # set to True to enable verbose D-Bus logging


def _log(*args: object) -> None:
    if DEBUG:
        decky.logger.debug(' '.join(str(a) for a in args))


def _addr(path: str, interface: str) -> DBusAddress:
    return DBusAddress(path, bus_name=BLUEZ_SERVICE, interface=interface)


def _forget_adapter() -> None:
    """Drop the cached adapter path so the next call rediscovers it."""
    global _adapter_path
    _adapter_path = None


async def _managed_objects(router):
    om_addr = _addr('/', OBJECT_MANAGER_IFACE)
    msg = new_method_call(om_addr, 'GetManagedObjects')
    _log('>> GetManagedObjects')
    reply = await router.send_and_get_reply(msg)
    return unwrap_msg(reply)[0]


async def _adapter_path_of(router) -> str:
    """Find the object path of the first BlueZ adapter.

    The path is not always /org/bluez/hci0. A machine with a second radio, or one
    where the internal radio enumerates late, gets hci1 or higher, and every
    adapter call then fails against a hardcoded path.
    """
    global _adapter_path
    if _adapter_path:
        return _adapter_path
    for path, interfaces in sorted((await _managed_objects(router)).items()):
        if ADAPTER_IFACE in interfaces:
            _adapter_path = path
            _log('adapter path →', path)
            return path
    raise RuntimeError('no BlueZ adapter found')


async def _device_path_of(router, mac: str) -> str:
    """Find the object path BlueZ uses for a MAC.

    BlueZ scopes device objects under their adapter (/org/bluez/hciN/dev_...), so
    a path built from a fixed adapter breaks connect and disconnect too, not only
    the adapter calls. Match on the reported Address instead of building a path.
    """
    for path, interfaces in (await _managed_objects(router)).items():
        if DEVICE_IFACE not in interfaces:
            continue
        if str(_prop(interfaces[DEVICE_IFACE], 'Address', '')).upper() == mac.upper():
            _log('device path →', path)
            return path
    raise RuntimeError(f'no BlueZ device object for {mac}')


def _prop(props: dict, key: str, default):  # type: ignore[type-arg]
    """Extract value from a jeepney property dict entry — values are (signature, value) tuples."""
    return props[key][1] if key in props else default


def _sysfs_battery(mac: str):
    """Read the battery level the kernel publishes for a device, or None.

    BlueZ only exposes org.bluez.Battery1 for devices that report their battery
    over GATT. A DualShock or DualSense is HID over BR/EDR and reports through its
    kernel driver instead, which shows up as
    /sys/class/power_supply/ps-controller-battery-<mac>/capacity. Generic HID
    devices use hid-<mac>-battery, so the match is on the MAC, not on a prefix.
    This reads without root, so it fits the permissions the plugin already has.
    """
    if not mac:
        return None
    needle = mac.lower()
    try:
        entries = os.listdir(POWER_SUPPLY_PATH)
    except OSError as e:
        _log('sysfs battery: cannot list', POWER_SUPPLY_PATH, e)
        return None
    for entry in entries:
        if needle not in entry.lower():
            continue
        try:
            with open(os.path.join(POWER_SUPPLY_PATH, entry, 'capacity')) as f:
                level = int(f.read().strip())
            _log('sysfs battery:', entry, '→', level)
            return level
        except (OSError, ValueError) as e:
            _log('sysfs battery: cannot read', entry, e)
    return None


class Plugin:
    async def get_bluetooth_status(self):
        _log('>> get_bluetooth_status()')
        try:
            async with open_dbus_router(bus='SYSTEM') as router:
                msg = Properties(_addr(await _adapter_path_of(router), ADAPTER_IFACE)).get('Powered')
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)
            result = bool(unwrap_msg(reply)[0][1])
            _log('<< get_bluetooth_status →', result)
            return result
        except Exception as e:
            _forget_adapter()
            decky.logger.error(f'get_bluetooth_status failed: {e}')
            return False

    async def get_paired_devices_with_info(self):
        _log('>> get_paired_devices_with_info()')
        try:
            async with open_dbus_router(bus='SYSTEM') as router:
                objects = await _managed_objects(router)
        except Exception as e:
            decky.logger.error(f'get_paired_devices_with_info failed: {e}')
            return []

        devices = []
        for _path, interfaces in objects.items():
            if DEVICE_IFACE not in interfaces:
                continue
            props = interfaces[DEVICE_IFACE]
            if not _prop(props, 'Paired', False):
                continue
            mac = _prop(props, 'Address', '')
            battery = None
            if BATTERY_IFACE in interfaces:
                battery = _prop(interfaces[BATTERY_IFACE], 'Percentage', None)
            if battery is None:
                battery = _sysfs_battery(mac)
            devices.append({
                'mac': mac,
                'name': _prop(props, 'Name', 'Unnamed device'),
                'connected': _prop(props, 'Connected', False),
                'icon': _prop(props, 'Icon', ''),
                'battery': battery,
            })
        _log('<< get_paired_devices_with_info →', devices)
        return devices

    async def get_device_info(self, device: str):
        _log(f'>> get_device_info({device!r})')
        try:
            async with open_dbus_router(bus='SYSTEM') as router:
                path = await _device_path_of(router, device)
                msg = Properties(_addr(path, DEVICE_IFACE)).get_all()
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)

                battery = None
                try:
                    batt_msg = Properties(_addr(path, BATTERY_IFACE)).get('Percentage')
                    batt_reply = await router.send_and_get_reply(batt_msg)
                    battery = unwrap_msg(batt_reply)[0][1]
                except Exception:
                    pass

            props = dict(unwrap_msg(reply)[0])
            if battery is None:
                battery = _sysfs_battery(_prop(props, 'Address', device))
            result = {
                'mac':           _prop(props, 'Address', device),
                'name':          _prop(props, 'Alias', None) or _prop(props, 'Name', 'Unnamed device'),
                'connected':     _prop(props, 'Connected', False),
                'icon':          _prop(props, 'Icon', ''),
                'original_name': _prop(props, 'Name', None),
                'paired':        _prop(props, 'Paired', False),
                'trusted':       _prop(props, 'Trusted', False),
                'blocked':       _prop(props, 'Blocked', False),
                'address_type':  _prop(props, 'AddressType', None),
                'uuids':         list(_prop(props, 'UUIDs', [])),
                'rssi':          _prop(props, 'RSSI', None),
                'tx_power':      _prop(props, 'TxPower', None),
                'device_class':  _prop(props, 'Class', None),
                'appearance':    _prop(props, 'Appearance', None),
                'battery':       battery,
            }
            _log(f'<< get_device_info → {result}')
            return result
        except Exception as e:
            decky.logger.error(f'get_device_info failed for {device}: {e}')
            return {
                'mac': device,
                'name': 'Unnamed device',
                'connected': False,
                'icon': '',
                'battery': None,
            }

    async def toggle_device_connection(self, device: str, connected: bool):
        method = 'Disconnect' if connected else 'Connect'
        _log(f'>> toggle_device_connection({device!r}, connected={connected}) → calling {method}')
        try:
            async with open_dbus_router(bus='SYSTEM') as router:
                msg = new_method_call(_addr(await _device_path_of(router, device), DEVICE_IFACE), method)
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)
            unwrap_msg(reply)
            _log('<< toggle_device_connection → ok')
            return True
        except Exception as e:
            decky.logger.error(f'toggle_device_connection failed for {device}: {e}')
            return False

    async def toggle_bluetooth(self, state: bool):
        _log(f'>> toggle_bluetooth(state={state})')
        try:
            async with open_dbus_router(bus='SYSTEM') as router:
                adapter = _addr(await _adapter_path_of(router), ADAPTER_IFACE)
                msg = Properties(adapter).set('Powered', 'b', state)
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)
            unwrap_msg(reply)
            _log('<< toggle_bluetooth → ok')
            return True
        except Exception as e:
            _forget_adapter()
            decky.logger.error(f'toggle_bluetooth failed: {e}')
            return False

    async def _main(self):
        decky.logger.info('Bluetooth plugin loaded')

    async def _unload(self):
        decky.logger.info('Bluetooth plugin unloaded')

    async def _uninstall(self):
        decky.logger.info('Bluetooth plugin uninstalled')

    async def _migration(self):
        decky.logger.info('Migrating Bluetooth plugin data')
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                        '.config', 'Bluetooth', 'bluetooth.log'))
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, 'settings', 'Bluetooth.json'),
            os.path.join(decky.DECKY_USER_HOME, '.config', 'Bluetooth'))
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, 'Bluetooth'),
            os.path.join(decky.DECKY_USER_HOME, '.local', 'share', 'Bluetooth'))
