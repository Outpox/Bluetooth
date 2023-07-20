import subprocess
import re

class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def get_bluetooth_status(self):
        status = subprocess.run(["bluetoothctl", "show"],timeout=10, text=True, capture_output=True).stdout
        return status

    # A normal method. It can be called from JavaScript using call_plugin_function("method_2", argument1, argument2)
    async def get_paired_devices(self):
        bctl_version = re.findall(r'[0-9]+', subprocess.run(["bluetoothctl", "version"], timeout=10, text=True, capture_output=True).stdout)
        # Check for bluetoothctl version greater or equal to 5.66 (always true if mayor is > 5)
        if len(bctl_version) == 2 and (int(bctl_version[0]) > 5 or (bctl_version[0] == 5 and int(bctl_version[1]) >= 66)):
            devices = subprocess.run(["bluetoothctl", "devices", "Paired"], timeout=10, text=True, capture_output=True).stdout
        else:
            devices = subprocess.run(["bluetoothctl", "paired-devices"],timeout=10, text=True, capture_output=True).stdout
        return devices

    async def get_device_info(self, device):
        device = subprocess.run(["bluetoothctl", "info", device],timeout=10, text=True, capture_output=True).stdout
        return device

    async def toggle_device_connection(self, device, connected):
        if not connected:
            stdout = subprocess.run(["bluetoothctl", "connect", device],timeout=10, text=True, capture_output=True).stdout
        else:
            stdout = subprocess.run(["bluetoothctl", "disconnect", device],timeout=10, text=True, capture_output=True).stdout
        return stdout
