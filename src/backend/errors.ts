export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class BluetoothStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BluetoothStatusError';
  }
}

export class PairedDevicesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PairedDevicesError';
  }
}

export class DeviceInfoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeviceInfoError';
  }
}

export class DeviceConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeviceConnectionError';
  }
}
