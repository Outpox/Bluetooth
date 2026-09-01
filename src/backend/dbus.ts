import { callable } from '@decky/api';
import { Device } from '../components/device';
import { retryWithTO } from '../utils';
import { BluetoothStatusError, DeviceInfoError, PairedDevicesError, TimeoutError } from './errors';
import { logger } from './logger';

const _getBluetoothStatus = callable<[], boolean>('get_bluetooth_status');
const _getPairedDevicesWithInfo = callable<[], Device[]>('get_paired_devices_with_info');
const _getDeviceInfo = callable<[device: string], Device>('get_device_info');
const _toggleBluetooth = callable<[state: boolean], boolean>('toggle_bluetooth');
const _toggleDeviceConnection = callable<[device: string, connected: boolean], boolean>('toggle_device_connection');

async function call<T>(name: string, args: unknown[], fn: () => Promise<T>): Promise<T> {
  logger.debug(`>> ${name}(${JSON.stringify(args)})`);
  try {
    const result = await fn();
    logger.debug(`<< ${name} →`, result);
    return result;
  } catch (e) {
    logger.error(`!! ${name} →`, e);
    throw e;
  }
}

export class BluetoothController {
  getStatus(): Promise<boolean> {
    return call('get_bluetooth_status', [], () =>
      retryWithTO(() => _getBluetoothStatus()).catch(error => {
        if (error instanceof TimeoutError) {
          throw new BluetoothStatusError('Timed out retrieving bluetooth status');
        }
        throw error;
      }),
    );
  }

  getPairedDevicesWithInfo(): Promise<Device[]> {
    return call('get_paired_devices_with_info', [], () =>
      retryWithTO(() => _getPairedDevicesWithInfo()).catch(error => {
        if (error instanceof TimeoutError) {
          throw new PairedDevicesError('Timed out retrieving paired devices');
        }
        throw error;
      }),
    );
  }

  getDeviceInfo(mac: string): Promise<Device> {
    return call('get_device_info', [mac], () =>
      retryWithTO(() => _getDeviceInfo(mac)).catch(error => {
        if (error instanceof TimeoutError) {
          throw new DeviceInfoError('Timed out retrieving device info');
        }
        throw error;
      }),
    );
  }

  toggleBluetooth(currentStatus: boolean): Promise<boolean> {
    return call('toggle_bluetooth', [!currentStatus], () =>
      retryWithTO(() => _toggleBluetooth(!currentStatus)).catch(error => {
        if (error instanceof TimeoutError) {
          throw new BluetoothStatusError('Timed out setting bluetooth status');
        }
        throw error;
      }),
    );
  }

  toggleDeviceConnection(mac: string, connected: boolean): Promise<boolean> {
    return call('toggle_device_connection', [mac, connected], () => _toggleDeviceConnection(mac, connected));
  }
}
