import { callable } from '@decky/api';
import { retryWithTO } from '../utils';
import {
  BluetoothStatusError,
  DeviceConnectionError,
  DeviceInfoError,
  PairedDevicesError,
  TimeoutError,
} from './errors';

const _getBluetoothStatus = callable<[], string>('get_bluetooth_status');
const _getPairedDevices = callable<[], string>('get_paired_devices');
const _getDeviceInfo = callable<[device: string], string>('get_device_info');
const _toggleBluetooth = callable<[state: string], string>('toggle_bluetooth');
const _toggleDeviceConnection = callable<[device: string, connected: boolean], string>('toggle_device_connection');

export class BluetoothController {
  getStatus(): Promise<string> {
    return retryWithTO(() => _getBluetoothStatus()).catch(error => {
      if (error instanceof TimeoutError) {
        throw new BluetoothStatusError('Timed out retrieving bluetooth status');
      }
      throw error;
    });
  }

  getPairedDevices(): Promise<string> {
    return retryWithTO(() => _getPairedDevices()).catch(error => {
      if (error instanceof TimeoutError) {
        throw new PairedDevicesError('Timed out retrieving paired devices');
      }
      throw error;
    });
  }

  getDeviceWithInfo(mac: string): Promise<string> {
    return retryWithTO(() => _getDeviceInfo(mac)).catch(error => {
      if (error instanceof TimeoutError) {
        throw new DeviceInfoError('Timed out retrieving device info');
      }
      throw error;
    });
  }

  setBluetooth(status: boolean): Promise<string> {
    const state = status ? 'on' : 'off';
    return retryWithTO(() => _toggleBluetooth(state)).catch(error => {
      if (error instanceof TimeoutError) {
        throw new BluetoothStatusError('Timed out setting bluetooth status');
      }
      throw error;
    });
  }

  setDeviceConnection(mac: string, connected: boolean): Promise<string> {
    return retryWithTO(() => _toggleDeviceConnection(mac, connected)).catch(error => {
      if (error instanceof TimeoutError) {
        throw new DeviceConnectionError('Timed out setting device connection');
      }
      throw error;
    });
  }
}
