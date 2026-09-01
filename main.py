import asyncio
import os
import sys
from typing import Any
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'py_modules'))

import decky
from jeepney import DBusAddress, Properties, new_method_call
from jeepney.io.asyncio import open_dbus_router
from jeepney.wrappers import DBusErrorResponse, unwrap_msg

BLUEZ_SERVICE = 'org.bluez'
OBJECT_MANAGER_IFACE = 'org.freedesktop.DBus.ObjectManager'
ADAPTER_IFACE = 'org.bluez.Adapter1'
DEVICE_IFACE = 'org.bluez.Device1'
BATTERY_IFACE = 'org.bluez.Battery1'

POWER_SUPPLY_PATH = '/sys/class/power_supply'

_adapter_path = None

DEBUG = False  # set to True to enable verbose D-Bus logging


class BluezObjectNotFound(Exception):
    """BlueZ answered, but it has no object for what we asked about."""


def _log(*args: object) -> None:
    if DEBUG:
        decky.logger.debug(' '.join(str(a) for a in args))


def _addr(path: str, interface: str) -> DBusAddress:
    return DBusAddress(path, bus_name=BLUEZ_SERVICE, interface=interface)


async def _managed_objects(router):
    om_addr = _addr('/', OBJECT_MANAGER_IFACE)
    msg = new_method_call(om_addr, 'GetManagedObjects')
    _log('>> GetManagedObjects')
    reply = await router.send_and_get_reply(msg)
    return unwrap_msg(reply)[0]


async def _adapter_path_of(router) -> str:
    """Find the object path of the adapter the paired devices sit under.

    A dock or a USB dongle can own hci0 while the radio holding the user's
    devices sits at hci1, so the lowest path is only the fallback.
    """
    global _adapter_path
    if _adapter_path:
        return _adapter_path
    objects = await _managed_objects(router)
    adapters = sorted(path for path, ifaces in objects.items() if ADAPTER_IFACE in ifaces)
    if not adapters:
        raise BluezObjectNotFound('no BlueZ adapter found')
    for path, ifaces in objects.items():
        if DEVICE_IFACE not in ifaces or not _prop(ifaces[DEVICE_IFACE], 'Paired', False):
            continue
        owner = path.rsplit('/', 1)[0]
        if owner in adapters:
            _adapter_path = owner
            _log('adapter path →', owner, '(owns a paired device)')
            return owner
    _adapter_path = adapters[0]
    _log('adapter path →', _adapter_path, '(no paired device, lowest path)')
    return _adapter_path


async def _device_path_of(router, mac: str) -> str:
    """Find the object path BlueZ uses for a MAC.

    Device objects are scoped under their adapter, so match on the reported
    Address rather than building /org/bluez/hciN/dev_... from a fixed adapter.
    """
    for path, interfaces in (await _managed_objects(router)).items():
        if DEVICE_IFACE not in interfaces:
            continue
        if str(_prop(interfaces[DEVICE_IFACE], 'Address', '')).upper() == mac.upper():
            _log('device path →', path)
            return path
    raise BluezObjectNotFound(f'no BlueZ device object for {mac}')


def _prop(props: dict, key: str, default):  # type: ignore[type-arg]
    """Extract value from a jeepney property dict entry — values are (signature, value) tuples."""
    return props[key][1] if key in props else default


def _sysfs_battery(mac: str):
    """Read the battery level the kernel publishes for a device, or None.

    BlueZ exposes org.bluez.Battery1 only for GATT devices. A DualSense reports
    through its kernel driver as ps-controller-battery-<mac>, and generic HID
    devices as hid-<mac>-battery, so the match is on the MAC, not on a prefix.
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
    _router: Any = None
    _router_ctx: Any = None
    _router_lock: asyncio.Lock

    async def _get_router(self):
        """Return the shared D-Bus router, opening it on first use.

        A router per call left jeepney's receiver task pending at context exit,
        which the loop reported as "Task was destroyed but it is pending".
        """
        async with self._router_lock:
            if self._router is None:
                self._router_ctx = open_dbus_router(bus='SYSTEM')
                self._router = await self._router_ctx.__aenter__()
                _log('opened the D-Bus router')
            return self._router

    async def _close_router(self):
        """Close the shared router and drop the cached adapter path.

        jeepney's receiver calls drop_all() on its way out, so this aborts every
        reply another call is waiting for. Reserve it for a broken transport.
        """
        global _adapter_path
        async with self._router_lock:
            _adapter_path = None
            ctx, self._router_ctx, self._router = self._router_ctx, None, None
            if ctx is None:
                return
            try:
                await ctx.__aexit__(None, None, None)
                _log('closed the D-Bus router')
            except Exception as e:
                decky.logger.warning(f'closing the D-Bus router failed: {e}')
            finally:
                # jeepney re-raises the receiver's error before it ever reaches
                # conn.close(), so a dropped link leaks the socket without this.
                conn = getattr(ctx, 'conn', None)
                if conn is not None:
                    try:
                        await conn.close()
                    except Exception as e:
                        _log('closing the D-Bus connection failed:', e)

    async def _send(self, msg):
        router = await self._get_router()
        _log('>> D-Bus message:', msg.header, msg.body)
        reply = await router.send_and_get_reply(msg)
        _log('<< D-Bus reply:', reply.header, reply.body)
        return unwrap_msg(reply)

    async def _recover(self, error: Exception):
        """Drop the connection when the transport broke, not when BlueZ refused.

        Both excluded errors mean the bus carried the message, so tearing the
        connection down would abort every other in-flight call for nothing.
        """
        if not isinstance(error, (DBusErrorResponse, BluezObjectNotFound)):
            await self._close_router()

    async def get_bluetooth_status(self):
        _log('>> get_bluetooth_status()')
        try:
            router = await self._get_router()
            msg = Properties(_addr(await _adapter_path_of(router), ADAPTER_IFACE)).get('Powered')
            result = bool((await self._send(msg))[0][1])
            _log('<< get_bluetooth_status →', result)
            return result
        except Exception as e:
            await self._recover(e)
            decky.logger.error(f'get_bluetooth_status failed: {e}')
            return False

    async def get_paired_devices_with_info(self):
        _log('>> get_paired_devices_with_info()')
        try:
            objects = await _managed_objects(await self._get_router())
        except Exception as e:
            await self._recover(e)
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
            router = await self._get_router()
            path = await _device_path_of(router, device)
            body = await self._send(Properties(_addr(path, DEVICE_IFACE)).get_all())

            battery = None
            try:
                battery = (await self._send(Properties(_addr(path, BATTERY_IFACE)).get('Percentage')))[0][1]
            except Exception:
                pass

            props = dict(body[0])
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
            router = await self._get_router()
            await self._send(new_method_call(_addr(await _device_path_of(router, device), DEVICE_IFACE), method))
            _log('<< toggle_device_connection → ok')
            return True
        except Exception as e:
            await self._recover(e)
            decky.logger.error(f'toggle_device_connection failed for {device}: {e}')
            return False

    async def toggle_bluetooth(self, state: bool):
        _log(f'>> toggle_bluetooth(state={state})')
        try:
            router = await self._get_router()
            adapter = _addr(await _adapter_path_of(router), ADAPTER_IFACE)
            await self._send(Properties(adapter).set('Powered', 'b', state))
            _log('<< toggle_bluetooth → ok')
            return True
        except Exception as e:
            await self._recover(e)
            decky.logger.error(f'toggle_bluetooth failed: {e}')
            return False

    async def _main(self):
        # Bound to the running loop rather than to import time.
        self._router_lock = asyncio.Lock()
        decky.logger.info('Bluetooth plugin loaded')

    async def _unload(self):
        await self._close_router()
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
