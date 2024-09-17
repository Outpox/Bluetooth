import { Focusable, PanelSectionRow, Router } from 'decky-frontend-lib';
import { ReactElement, VFC } from 'react';
import { Backend } from '../server';
import { i18n } from '../utils';
import { BluetoothIcon, GamepadIcon, HeadsetIcon, KeyboardIcon, SettingsIcon, XboxControllerIcon } from './deckIcons';
import { PiMouseBold } from 'react-icons/pi';

export interface Device {
  mac: string;
  name: string;
  connected: boolean;
  icon: string;
}

export const Device: VFC<{
  device: Device;
  backend: Backend;
  refresh: () => void;
  setLoading: (state: boolean) => void;
}> = ({ device, backend, refresh, setLoading }) => {
  const getIcon = (): ReactElement => {
    switch (device.icon) {
      case 'input-gaming':
        return device.name.toLocaleLowerCase().includes('xbox') ? <XboxControllerIcon /> : <GamepadIcon />;
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
    setLoading(true);
    void backend.toggleDeviceConnection(device).then(refresh);
  };

  const settings = () => {
    Router.Navigate('/device-settings/' + device.mac);
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
                {device.connected ? (
                  <span className="uppercase">{i18n('Settings_Bluetooth_Connected')}</span>
                ) : (
                  <span className="uppercase">{i18n('Settings_Bluetooth_NotConnected')}</span>
                )}
              </div>
            </div>
          </Focusable>
          <Focusable flow-children="horizontal" onActivate={settings} className="options-container" noFocusRing={false}>
            <div className="options-btn">
              <SettingsIcon />
            </div>
          </Focusable>
        </Focusable>
      </PanelSectionRow>
    </>
  );
};
