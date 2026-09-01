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
  refresh,
  setLoading,
}: {
  device: Device;
  refresh: () => void;
  setLoading: (state: boolean) => void;
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
    // A second activation while the D-Bus call runs would queue a contradictory
    // Connect/Disconnect, so the row ignores input until the call returns.
    if (busy) {
      return;
    }
    setBusy(true);
    setLoading(true);
    void toggleDeviceConnection(device)
      .then(refresh)
      .finally(() => setBusy(false));
  };

  return (
    <>
      <PanelSectionRow>
        <Focusable noFocusRing={true} className="custom-container" flow-children="row">
          <Focusable onActivate={connect} className="connect-container" noFocusRing={false}>
            <div className="device-icon">{getIcon()}</div>
            <div className={`device-info ${device.connected ? 'connected' : 'disconnected'}`}>
              <div className="device-name">{device.name}</div>
              <div className="device-status">
                {busy ? (
                  <>
                    <span className="device-spinner" />
                    <span className="uppercase">
                      {device.connected
                        ? i18n('Settings_Bluetooth_Disconnecting', 'Disconnecting')
                        : i18n('Settings_Bluetooth_Connecting', 'Connecting')}
                    </span>
                  </>
                ) : (
                  <>
                    {device.connected ? (
                      <span className="uppercase">{i18n('Settings_Bluetooth_Connected')}</span>
                    ) : (
                      <span className="uppercase">{i18n('Settings_Bluetooth_NotConnected')}</span>
                    )}
                    {device.battery != null && <span> · {device.battery}%</span>}
                  </>
                )}
              </div>
            </div>
          </Focusable>
        </Focusable>
      </PanelSectionRow>
    </>
  );
}
