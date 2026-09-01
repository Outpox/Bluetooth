import { Device } from './components/device';
import { DeviceInfoError } from './backend/errors';
import { BluetoothController } from './backend/dbus';

const controller = new BluetoothController();

export async function getBluetoothStatus(): Promise<boolean> {
  return controller.getStatus().catch(error => {
    console.error(error);
    return false;
  });
}

export async function getPairedDevicesWithInfo(): Promise<Device[]> {
  return controller.getPairedDevicesWithInfo().catch(error => {
    console.error(error);
    return [];
  });
}

export async function getPairedDeviceWithInfo(mac: string): Promise<Device | DeviceInfoError> {
  return controller.getDeviceInfo(mac).catch((error: DeviceInfoError) => {
    console.error(error);
    return error;
  });
}

export async function toggleBluetooth(status: boolean): Promise<void> {
  return controller.toggleBluetooth(status).catch(console.error);
}

export async function toggleDeviceConnection(device: Device): Promise<void> {
  return controller.toggleDeviceConnection(device.mac, device.connected).catch(console.error);
}
