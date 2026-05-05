import { callable } from '@decky/api';
import { Device } from './components/device';
import { PairedDevices, parseBluetoothStatus, parseDevices, parseDevicesInfo } from './utils';

const _getBluetoothStatus = callable<[], string>('get_bluetooth_status');
const _getPairedDevices = callable<[], string>('get_paired_devices');
const _getDeviceInfo = callable<[device: string], string>('get_device_info');
const _toggleBluetooth = callable<[state: string], string>('toggle_bluetooth');
const _toggleDeviceConnection = callable<[device: string, connected: boolean], string>('toggle_device_connection');

export async function getBluetoothStatus(): Promise<boolean> {
  const status = await _getBluetoothStatus();
  return parseBluetoothStatus(status);
}

export async function getPairedDevices(): Promise<PairedDevices[]> {
  const response = await _getPairedDevices();
  return parseDevices(response);
}

export async function getPairedDevicesWithInfo(): Promise<Device[]> {
  const pairedDevices = await getPairedDevices();
  const pairedDevicesWithInfo = await Promise.all(
    pairedDevices.map(pairedDevice => _getDeviceInfo(pairedDevice.mac))
  );
  return parseDevicesInfo(pairedDevicesWithInfo);
}

export async function toggleBluetooth(status: boolean): Promise<void> {
  const state = status ? 'off' : 'on';
  await _toggleBluetooth(state);
}

export async function toggleDeviceConnection(device: Device): Promise<string> {
  return _toggleDeviceConnection(device.mac, device.connected);
}
