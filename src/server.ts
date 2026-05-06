import { Device } from './components/device';
import { DeviceInfoError } from './backend/errors';
import { BluetoothController } from './backend/bluetoothctl';
import { parseBluetoothStatus, parseDeviceInfo, parseDevices, parseDevicesInfo, PairedDevices } from './backend/parsers';

export { PairedDevices };

const controller = new BluetoothController();

export async function getBluetoothStatus(): Promise<boolean> {
  return controller
    .getStatus()
    .then(response => parseBluetoothStatus(response))
    .catch(error => {
      console.error(error);
      return false;
    });
}

export async function getPairedDevices(): Promise<PairedDevices[]> {
  return controller
    .getPairedDevices()
    .then(response => parseDevices(response))
    .catch(error => {
      console.error(error);
      return [];
    });
}

export async function getPairedDeviceWithInfo(mac: string): Promise<Device | DeviceInfoError> {
  return controller
    .getDeviceWithInfo(mac)
    .then(response => parseDevicesInfo([response])[0])
    .catch((error: DeviceInfoError) => {
      console.error(error);
      return error;
    });
}

export async function getPairedDevicesWithInfo(): Promise<Device[]> {
  const pairedDevices = await getPairedDevices();
  const results = await Promise.all(
    pairedDevices.map(pairedDevice =>
      controller
        .getDeviceWithInfo(pairedDevice.mac)
        .catch(error => {
          console.error(error);
          return undefined;
        }),
    ),
  );
  return results
    .filter((r): r is string => r !== undefined)
    .map(device => parseDeviceInfo(device));
}

export async function toggleBluetooth(status: boolean): Promise<void> {
  controller.setBluetooth(!status).then(console.log).catch(console.error);
}

export async function toggleDeviceConnection(device: Device): Promise<void> {
  controller.setDeviceConnection(device.mac, !device.connected).then(console.log).catch(console.error);
}
