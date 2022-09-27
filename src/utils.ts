import { Device } from './components/device';

export function parseBluetoothStatus(output: string) {
  const powered = (/Powered: (.*)/.exec(output) ?? [])[1] === 'yes' || false;
  return powered
    ? 'ON'
    : 'OFF';
}

export function parseDevices(output: string): PairedDevices[] {
  return [...output.matchAll(/Device (([0-9A-F]{2}[:-]){5}([0-9A-F]{2})) (.*)$/gmi)]
    .map(captureGroups => ({
      mac: captureGroups[1],
      name: captureGroups[4] || 'Unnamed device',
    }));
}

export function parseDevicesInfo(output: string[]): Device[] {
  // Might be interesting to return the alias instead of name if defined.
  return output.map(device => ({
    mac: /Device (([0-9A-F]{2}[:-]){5}([0-9A-F]{2}))/.exec(device)![1],
    name: (/Name: (.*)/.exec(device) ?? [])[1] || 'Unnamed device',
    connected: /Connected: yes/.test(device),
    icon: (/Icon: (.*)/.exec(device) ?? [])[1] || '',
  }));
}

export interface PairedDevices {
  mac: string;
  name: string;
}
