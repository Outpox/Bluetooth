import { ServerAPI } from 'decky-frontend-lib';
import { Device } from './components/device';
import { PairedDevices, parseBluetoothStatus, parseDevices, parseDevicesInfo } from './utils';

let backend: Backend;

export class Backend {
  serverAPI: ServerAPI;

  static get instance() {
    return backend;
  }

  static initialize(server: ServerAPI) {
    backend = new Backend(server);
    return backend;
  }

  private constructor(server: ServerAPI) {
    this.serverAPI = server;
  }

  async getBluetoothStatus(): Promise<boolean> {
    const status = (await this.serverAPI.callPluginMethod('get_bluetooth_status', {})).result as string;
    return parseBluetoothStatus(status);
  }

  async getPairedDevices(): Promise<PairedDevices[]> {
    const pairedDevicesResponse = (await this.serverAPI.callPluginMethod('get_paired_devices', {})).result as string;
    return parseDevices(pairedDevicesResponse);
  }

  async getPairedDevicesWithInfo(): Promise<Device[]> {
    const pairedDevices = await this.getPairedDevices();
    const pairedDevicesWithInfo = await Promise.all(
      pairedDevices.map(
        async pairedDevice => (await this.serverAPI.callPluginMethod('get_device_info', { device: pairedDevice.mac })).result as string
      )
    );
    return parseDevicesInfo(pairedDevicesWithInfo);
  }

  async toggleDeviceConnection(device: Device) {
    return this.serverAPI.callPluginMethod('toggle_device_connection', { device: device.mac, connected: device.connected });
  }
}
