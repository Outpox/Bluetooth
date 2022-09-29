import { Field } from 'decky-frontend-lib';
import { ReactElement, VFC } from 'react';
import { BiBluetooth } from 'react-icons/bi';
import { BsHeadphones, BsHeadset, BsController } from 'react-icons/bs';
import { Backend } from '../server';
import { i18n } from '../utils';

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
}> = ({
  device,
  backend,
  refresh,
  setLoading,
}) => {
  const getIcon = (): ReactElement => {
    switch (device.icon) {
      case 'input-gaming':
        return <BsController/>;
      case 'audio-headset':
        return <BsHeadset/>;
      case 'audio-headphones':
        return <BsHeadphones/>;
      default:
        return <BiBluetooth/>;
    }
  };

  const toggleDeviceConnection = () => {
    setLoading(true);
    void backend.toggleDeviceConnection(device).then(refresh);
  };

  return (
    <Field
      description={device.connected
        ? <span className='connected uppercase'>{i18n('Settings_Bluetooth_Connected')}</span>
        : <span className='disconnected uppercase'>{i18n('Settings_Bluetooth_NotConnected')}</span>}
      className={`no-flex-grow closer-description ${device.connected ? 'connected' : 'disconnected'}`}
      icon={getIcon()}
      onClick={toggleDeviceConnection}
    >
      <span>{device.name}</span>
    </Field>
  );
};
