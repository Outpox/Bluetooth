export declare global {
  const SteamClient: {
    System: {
      Bluetooth: {
        SetEnabled: (enabled: boolean) => Promise<void>;
        RegisterForStateChanges: ((cb: (change: BluetoothStateChange) => void) => undefined);
      };
    };
  };
  const LocalizationManager: {
    m_cbkTokensChanged: unknown;
    m_mapFallbackTokens: Map<string, string>;
    m_mapTokens: Map<string, string>;
    m_rgLocalesToUse: string[];
  };
}

export interface BluetoothStateChange {
  bEnabled: boolean;
  vecAdapters: Adapter[];
  vecDevices: Device[];
}

private interface BluetoothEntity {
  nId: number;
  sMAC: string;
  sName: string;
}

export interface Adapter extends baseBluetoothEntity {
  bEnabled: boolean;
  bDiscovering: boolean;
}

export interface Device extends baseBluetoothEntity {
  nAdapterId: number;
  eType: number; // Maps to a BluetoothDeviceType;
}

export enum BluetoothDeviceType {
  0 = 'k_BluetoothDeviceType_Invalid',
  1 = 'k_BluetoothDeviceType_Unknown',
  2 = 'k_BluetoothDeviceType_Phone',
  3 = 'k_BluetoothDeviceType_Computer',
  4 = 'k_BluetoothDeviceType_Headset',
  5 = 'k_BluetoothDeviceType_Headphones',
  6 = 'k_BluetoothDeviceType_Speakers',
  7 = 'k_BluetoothDeviceType_OtherAudio',
  8 = 'k_BluetoothDeviceType_Mouse',
  9 = 'k_BluetoothDeviceType_Joystick',
  10 = 'k_BluetoothDeviceType_Gamepad',
  11 = 'k_BluetoothDeviceType_Keyboard'
}
