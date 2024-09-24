import { ServerAPI } from 'decky-frontend-lib';
import { retryWithTO } from '../utils';
import {
  BluetoothStatusError,
  DeviceConnectionError,
  DeviceInfoError,
  PairedDevicesError,
  TimeoutError,
} from './errors';

export class BluetoothController {
  serverAPI: ServerAPI;

  constructor(server: ServerAPI) {
    this.serverAPI = server;
  }

  getStatus() {
    return retryWithTO(() =>
      this.serverAPI.callPluginMethod<Record<string, never>, string>('get_bluetooth_status', {}),
    ).catch(error => {
      if (error instanceof TimeoutError) {
        throw new BluetoothStatusError('Timed out retrieving bluetooth status');
      }
      throw error;
    });
  }

  getPairedDevices() {
    return retryWithTO(() =>
      this.serverAPI.callPluginMethod<Record<string, never>, string>('get_paired_devices', {}),
    ).catch(error => {
      if (error instanceof TimeoutError) {
        throw new PairedDevicesError('Timed out retrieving paired devices');
      }
      throw error;
    });
  }

  getDeviceWithInfo(mac: string) {
    return retryWithTO(() =>
      this.serverAPI.callPluginMethod<{ device: string }, string>('get_device_info', { device: mac }),
    ).catch(error => {
      if (error instanceof TimeoutError) {
        throw new DeviceInfoError('Timed out retrieving device info');
      }
      throw error;
    });
  }

  setBluetooth(status: boolean) {
    const state = status ? 'on' : 'off';
    return retryWithTO(() =>
      this.serverAPI.callPluginMethod<{ state: string }, string>('toggle_bluetooth', { state }),
    ).catch(error => {
      if (error instanceof TimeoutError) {
        throw new BluetoothStatusError('Timed out setting bluetooth status');
      }
      throw error;
    });
  }

  setDeviceConnection(mac: string, connected: boolean) {
    return retryWithTO(() =>
      this.serverAPI.callPluginMethod<{ device: string; connected: boolean }, string>('toggle_device_connection', {
        device: mac,
        connected,
      }),
    ).catch(error => {
      if (error instanceof TimeoutError) {
        throw new DeviceConnectionError('Timed out setting device connection');
      }
      throw error;
    });
  }
}
