import { ServerAPI } from 'decky-frontend-lib';
import { Device } from './components/device';
import {
  PairedDevices,
  parseBluetoothStatus,
  parseDeviceInfo,
  parseDevices,
  parseDevicesInfo,
} from './backend/parsers';
import { BluetoothController } from './backend/bluetoothctl';
import { DeviceInfoError } from './backend/errors';

let backend: Backend;

export class Backend {
  serverAPI: ServerAPI;
  bluetoothController: BluetoothController;

  static get instance() {
    return backend;
  }

  static initialize(server: ServerAPI) {
    backend = new Backend(server);
    return backend;
  }

  private constructor(server: ServerAPI) {
    this.serverAPI = server;
    this.bluetoothController = new BluetoothController(server);
  }

  getBluetoothStatus(): Promise<boolean> {
    return this.bluetoothController
      .getStatus()
      .then(response => {
        console.log(response);
        return response;
      })
      .then(response => parseBluetoothStatus(response.result))
      .then(response => {
        console.log(response);
        return response;
      })
      .catch(error => {
        console.error(error);
        return false;
      });
  }

  getPairedDevices(): Promise<PairedDevices[]> {
    return this.bluetoothController
      .getPairedDevices()
      .then(response => parseDevices(response.result))
      .catch(error => {
        console.error(error);
        return [];
      });
  }

  getPairedDeviceWithInfo(mac: string): Promise<Device | DeviceInfoError> {
    return this.bluetoothController
      .getDeviceWithInfo(mac)
      .then(response => parseDevicesInfo([response.result])[0])
      .catch((error: DeviceInfoError) => {
        console.error(error);
        return error;
      });
  }

  async getPairedDevicesWithInfo(): Promise<Device[]> {
    const pairedDevices = await this.getPairedDevices();
    const pairedDevicesWithInfo = await Promise.all(
      pairedDevices
        .map(pairedDevice =>
          this.bluetoothController
            .getDeviceWithInfo(pairedDevice.mac)
            .then(response => response.result)
            .catch(error => {
              console.error(error);
              return undefined;
            }),
        )
        .filter((device): device is Promise<string> => device !== undefined),
    );

    return pairedDevicesWithInfo.map(device => parseDeviceInfo(device));
  }

  async toggleBluetooth(status: boolean) {
    this.bluetoothController.setBluetooth(!status).then(console.log).catch(console.error);
  }

  async toggleDeviceConnection(device: Device) {
    this.bluetoothController.setDeviceConnection(device.mac, !device.connected).then(console.log).catch(console.error);
  }
}
