import { Focusable, PanelSectionRow } from '@decky/ui';
import { ReactElement, useState } from 'react';
import { toggleDeviceConnection } from '../server';
import { i18n } from '../utils';
import { BluetoothIcon, GamepadIcon, HeadsetIcon, KeyboardIcon } from './deckIcons';
import { PiMouseBold } from 'react-icons/pi';

export interface Device {
  mac: string;
  name: string;
  connected: boolean;
  icon: string;
  battery?: number | null;
  [key: string]: unknown;
}

export function Device({
  device,
  enabled,
  failed,
  refresh,
  setLoading,
  onResult,
}: {
  device: Device;
  enabled: boolean;
  failed: boolean;
  refresh: () => Promise<void>;
  setLoading: (state: boolean) => void;
  onResult: (mac: string, ok: boolean, wasConnected: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const getIcon = (): ReactElement => {
    switch (device.icon) {
      case 'input-gaming':
        return <GamepadIcon />;
      case 'audio-headset':
        return <HeadsetIcon />;
      case 'audio-headphones':
        return <HeadsetIcon />;
      case 'input-keyboard':
        return <KeyboardIcon />;
      case 'input-mouse':
        return <PiMouseBold />;
      default:
        return <BluetoothIcon />;
    }
  };

  const connect = () => {
    // A second activation would queue a contradictory Connect/Disconnect.
    // With the radio off BlueZ refuses every Connect, and reporting that as a
    // device failure blames the device for a switch the user simply left off.
    if (busy || !enabled) {
      return;
    }
    setBusy(true);
    setLoading(true);
    void toggleDeviceConnection(device)
      // The refresh clears every stored failure, so report this one after it.
      .then(ok => refresh().then(() => onResult(device.mac, ok, device.connected)))
      .finally(() => setBusy(false));
  };

  const statusLabel = busy
    ? device.connected
      ? i18n('Internet_Network_State_Disconnecting', 'Disconnecting')
      : i18n('Internet_Network_State_Connecting', 'Connecting')
    : failed
      ? i18n('Settings_Bluetooth_Failed', 'Failed')
      : device.connected
        ? i18n('Settings_Bluetooth_Connected')
        : i18n('Settings_Bluetooth_NotConnected');

  return (
    <>
      <PanelSectionRow>
        <Focusable noFocusRing={true} className="custom-container" flow-children="row">
          <Focusable
            onActivate={enabled ? connect : undefined}
            onOKActionDescription={
              enabled
                ? device.connected
                  ? i18n('QuickAccess_Tab_Bluetooth_Disconnect', 'Disconnect')
                  : i18n('QuickAccess_Tab_Bluetooth_Connect', 'Connect')
                : undefined
            }
            className={enabled ? 'connect-container' : 'connect-container off'}
            noFocusRing={false}
          >
            <div className="device-icon">{getIcon()}</div>
            <div className={`device-info ${device.connected ? 'connected' : 'disconnected'}`}>
              <div className="device-name">{device.name}</div>
              <div className="device-status">
                {busy && <span className="device-spinner" />}
                <span className={failed && !busy ? 'uppercase failed' : 'uppercase'}>{statusLabel}</span>
                {!busy && !failed && device.battery != null && <span> · {device.battery}%</span>}
              </div>
            </div>
          </Focusable>
        </Focusable>
      </PanelSectionRow>
    </>
  );
}
