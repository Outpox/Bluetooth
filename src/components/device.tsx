import { Field } from '@decky/ui';
import { ReactElement } from 'react';
import { toggleDeviceConnection } from '../server';
import { i18n } from '../utils';
import { BluetoothIcon, GamepadIcon, HeadsetIcon, KeyboardIcon } from './icons';
import { PiMouseBold } from 'react-icons/pi';

export interface Device {
  mac: string;
  name: string;
  connected: boolean;
  icon: string;
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
  const getIcon = (): ReactElement => {
    switch (device.icon) {
      case 'input-gaming':
        return <GamepadIcon/>;
      case 'audio-headset':
        return <HeadsetIcon/>;
      case 'audio-headphones':
        return <HeadsetIcon/>;
      case 'input-keyboard':
        return <KeyboardIcon/>;
      case 'input-mouse':
        return <PiMouseBold/>;
      default:
        return <BluetoothIcon/>;
    }
  };

  const handleToggleDeviceConnection = () => {
    setLoading(true);
    void toggleDeviceConnection(device).then(refresh);
  };

  return (
    <Field
      description={device.connected
        ? <span className='connected uppercase'>{i18n('Settings_Bluetooth_Connected')}</span>
        : <span className='disconnected uppercase'>{i18n('Settings_Bluetooth_NotConnected')}</span>}
      className={`device ${device.connected ? 'connected' : 'disconnected'}`}
      icon={getIcon()}
      onClick={handleToggleDeviceConnection}
    >
      <span>{device.name}</span>
    </Field>
  );
}
