import os
import subprocess
import re
import decky

class Plugin:
    async def get_bluetooth_status(self):
        status = subprocess.run(["bluetoothctl", "show"], timeout=10, text=True, capture_output=True).stdout
        return status

    async def get_paired_devices(self):
        bctl_version = re.findall(r'[0-9]+', subprocess.run(["bluetoothctl", "version"], timeout=10, text=True, capture_output=True).stdout)
        # Check for bluetoothctl version greater or equal to 5.66 (always true if mayor is > 5)
        if len(bctl_version) == 2 and (int(bctl_version[0]) > 5 or (int(bctl_version[0]) == 5 and int(bctl_version[1]) >= 66)):
            devices = subprocess.run(["bluetoothctl", "devices", "Paired"], timeout=10, text=True, capture_output=True).stdout
        else:
            devices = subprocess.run(["bluetoothctl", "paired-devices"], timeout=10, text=True, capture_output=True).stdout
        return devices

    async def get_device_info(self, device):
        info = subprocess.run(["bluetoothctl", "info", device], timeout=10, text=True, capture_output=True).stdout
        return info

    async def toggle_device_connection(self, device, connected):
        if not connected:
            stdout = subprocess.run(["bluetoothctl", "connect", device], timeout=10, text=True, capture_output=True).stdout
        else:
            stdout = subprocess.run(["bluetoothctl", "disconnect", device], timeout=10, text=True, capture_output=True).stdout
        return stdout

    async def toggle_bluetooth(self, state):
        stdout = subprocess.run(["bluetoothctl", "power", state], timeout=10, text=True, capture_output=True).stdout
        return stdout

    async def _main(self):
        decky.logger.info("Bluetooth plugin loaded")

    async def _unload(self):
        decky.logger.info("Bluetooth plugin unloaded")

    async def _uninstall(self):
        decky.logger.info("Bluetooth plugin uninstalled")

    async def _migration(self):
        decky.logger.info("Migrating Bluetooth plugin data")
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                        ".config", "Bluetooth", "bluetooth.log"))
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "Bluetooth.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "Bluetooth"))
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "Bluetooth"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "Bluetooth"))
