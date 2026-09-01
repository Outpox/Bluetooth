import { Focusable, PanelSectionRow } from '@decky/ui';
import { ReactElement, useEffect, useState } from 'react';
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
  refresh,
  setLoading,
}: {
  device: Device;
  refresh: () => void;
  setLoading: (state: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [device.connected]);

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
    if (busy) {
      return;
    }
    setBusy(true);
    setFailed(false);
    setLoading(true);
    void toggleDeviceConnection(device)
      .then(ok => {
        setFailed(!ok);
        refresh();
      })
      .finally(() => setBusy(false));
  };

  const statusLabel = busy
    ? device.connected
      ? i18n('Settings_Bluetooth_Disconnecting', 'Disconnecting')
      : i18n('Settings_Bluetooth_Connecting', 'Connecting')
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
            onActivate={connect}
            onOKActionDescription={
              device.connected
                ? i18n('Settings_Bluetooth_Disconnect', 'Disconnect')
                : i18n('Settings_Bluetooth_Connect', 'Connect')
            }
            className="connect-container"
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
