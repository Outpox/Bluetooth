import subprocess
import re

class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def get_bluetooth_status(self):
        status = subprocess.run(["bluetoothctl", "show"], text=True, capture_output=True).stdout
        return status

    # A normal method. It can be called from JavaScript using call_plugin_function("method_2", argument1, argument2)
    async def get_paired_devices(self):
        devices = subprocess.run(["bluetoothctl", "paired-devices"], text=True, capture_output=True).stdout
        return devices

    async def get_device_info(self, device):
        device = subprocess.run(["bluetoothctl", "info", device], text=True, capture_output=True).stdout
        return device

    async def set_device_connection(self, device, status):
        if not status:
            stdout = subprocess.run(["bluetoothctl", "connect", device], text=True, capture_output=True).stdout
        else:
            stdout = subprocess.run(["bluetoothctl", "disconnect", device], text=True, capture_output=True).stdout
        return stdout

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        pass