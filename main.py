import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'py_modules'))

import decky
from jeepney import DBusAddress, Properties, new_method_call
from jeepney.io.asyncio import open_dbus_router

BLUEZ_SERVICE = 'org.bluez'
OBJECT_MANAGER_IFACE = 'org.freedesktop.DBus.ObjectManager'
ADAPTER_IFACE = 'org.bluez.Adapter1'
DEVICE_IFACE = 'org.bluez.Device1'
BATTERY_IFACE = 'org.bluez.Battery1'

# TODO: replace with dynamic adapter discovery via GetManagedObjects()
ADAPTER_PATH = '/org/bluez/hci0'

DEBUG = True  # set to True to enable verbose D-Bus logging


def _log(*args: object) -> None:
    if DEBUG:
        decky.logger.debug(' '.join(str(a) for a in args))


def _adapter_addr(interface: str = ADAPTER_IFACE) -> DBusAddress:
    return DBusAddress(ADAPTER_PATH, bus_name=BLUEZ_SERVICE, interface=interface)


def _device_addr(mac: str, interface: str = DEVICE_IFACE) -> DBusAddress:
    path = ADAPTER_PATH + '/dev_' + mac.replace(':', '_')
    return DBusAddress(path, bus_name=BLUEZ_SERVICE, interface=interface)


def _prop(props: dict, key: str, default):  # type: ignore[type-arg]
    """Extract value from a jeepney property dict entry — values are (signature, value) tuples."""
    return props[key][1] if key in props else default


class Plugin:
    async def get_bluetooth_status(self):
        _log('>> get_bluetooth_status()')
        async with open_dbus_router(bus='SYSTEM') as router:
            msg = Properties(_adapter_addr()).get('Powered')
            _log('>> D-Bus message:', msg.header, msg.body)
            reply = await router.send_and_get_reply(msg)
            _log('<< D-Bus reply:', reply.header, reply.body)
        result = reply.body[0][1]
        _log('<< get_bluetooth_status →', result)
        return result

    async def get_paired_devices_with_info(self):
        _log('>> get_paired_devices_with_info()')
        om_addr = DBusAddress('/', bus_name=BLUEZ_SERVICE, interface=OBJECT_MANAGER_IFACE)
        msg = new_method_call(om_addr, 'GetManagedObjects')
        async with open_dbus_router(bus='SYSTEM') as router:
            _log('>> D-Bus message:', msg.header, msg.body)
            reply = await router.send_and_get_reply(msg)
            _log('<< D-Bus reply body length:', len(reply.body[0]) if reply.body else 0)

        objects = reply.body[0]
        devices = []
        for _path, interfaces in objects.items():
            if DEVICE_IFACE not in interfaces:
                continue
            props = interfaces[DEVICE_IFACE]
            if not _prop(props, 'Paired', False):
                continue
            battery = None
            if BATTERY_IFACE in interfaces:
                battery = _prop(interfaces[BATTERY_IFACE], 'Percentage', None)
            devices.append({
                'mac': _prop(props, 'Address', ''),
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
            addr = _device_addr(device)
            async with open_dbus_router(bus='SYSTEM') as router:
                msg = Properties(addr).get_all()
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)

                battery = None
                try:
                    batt_msg = Properties(_device_addr(device, interface=BATTERY_IFACE)).get('Percentage')
                    batt_reply = await router.send_and_get_reply(batt_msg)
                    battery = batt_reply.body[0][1]
                except Exception:
                    pass

            props = dict(reply.body[0])
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
            }

    async def toggle_device_connection(self, device: str, connected: bool):
        method = 'Disconnect' if connected else 'Connect'
        _log(f'>> toggle_device_connection({device!r}, connected={connected}) → calling {method}')
        try:
            addr = _device_addr(device)
            msg = new_method_call(addr, method)
            async with open_dbus_router(bus='SYSTEM') as router:
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)
            _log(f'<< toggle_device_connection → ok')
        except Exception as e:
            decky.logger.error(f'toggle_device_connection failed for {device}: {e}')

    async def toggle_bluetooth(self, state: bool):
        _log(f'>> toggle_bluetooth(state={state})')
        try:
            msg = Properties(_adapter_addr()).set('Powered', 'b', state)
            async with open_dbus_router(bus='SYSTEM') as router:
                _log('>> D-Bus message:', msg.header, msg.body)
                reply = await router.send_and_get_reply(msg)
                _log('<< D-Bus reply:', reply.header, reply.body)
            _log('<< toggle_bluetooth → ok')
        except Exception as e:
            decky.logger.error(f'toggle_bluetooth failed: {e}')

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
