import mocks from './mocks';

import { parseBluetoothStatus, parseDevices, parseDevicesInfo } from '../src/utils';

describe('Status', () => {
  test('connected', () => {
    expect(parseBluetoothStatus(mocks['show-connected'])).toBe('ON');
  });

  test('disconnected', () => {
    expect(parseBluetoothStatus(mocks['show-disconnected'])).toBe('OFF');
  });

  test('empty string input', () => {
    expect(parseBluetoothStatus('')).toBe('OFF');
  });
});

describe('Paired devices', () => {
  test('with devices', () => {
    const devices = parseDevices(mocks['paired-devices']);
    expect(devices).toHaveLength(4);
    expect(devices[0].mac).toBe('F4:6A:D7:35:2C:F6');
    expect(devices[0].name).toBe('Xbox Elite Wireless Controller');
    expect(devices[1].mac).toBe('14:3F:A6:AD:95:D6');
    expect(devices[1].name).toBe('WH-1000XM4');
    expect(devices[2].mac).toBe('60:AB:D2:23:49:D4');
    expect(devices[2].name).toBe('Bose NC 700 HP');
    expect(devices[3].mac).toBe('28:9A:4B:31:8D:88');
    expect(devices[3].name).toBe('Arctis Pro Wireless');
  });

  test('without devices', () => {
    expect(parseDevices(mocks['paired-devices-empty'])).toHaveLength(0);
  });
});

describe('Devices info', () => {
  test('with icon', () => {
    const info = parseDevicesInfo([mocks.info]);
    expect(info).toBeDefined();
    expect(info[0].connected).toBe(false);
    expect(info[0].icon).toBe('audio-headset');
    expect(info[0].mac).toBe('28:9A:4B:31:8D:88');
    expect(info[0].name).toBe('Arctis Pro Wireless');
  });

  test('without icon', () => {
    const info = parseDevicesInfo([mocks['info-no-icon']]);
    expect(info).toBeDefined();
    expect(info[0].connected).toBe(false);
    expect(info[0].icon).toBe('');
    expect(info[0].mac).toBe('28:9A:4B:31:8D:88');
    expect(info[0].name).toBe('Arctis Pro Wireless');
  });
});
