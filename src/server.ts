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

/** Resolves to null when the backend could not be reached, [] when nothing is paired. */
export async function getPairedDevicesWithInfo(): Promise<Device[] | null> {
  return controller.getPairedDevicesWithInfo().catch(error => {
    console.error(error);
    return null;
  });
}

export async function getPairedDeviceWithInfo(mac: string): Promise<Device | DeviceInfoError> {
  return controller.getDeviceInfo(mac).catch((error: DeviceInfoError) => {
    console.error(error);
    return error;
  });
}

export async function toggleBluetooth(status: boolean): Promise<boolean> {
  return controller.toggleBluetooth(status).catch(error => {
    console.error(error);
    return false;
  });
}

export async function toggleDeviceConnection(device: Device): Promise<boolean> {
  return controller.toggleDeviceConnection(device.mac, device.connected).catch(error => {
    console.error(error);
    return false;
  });
}
