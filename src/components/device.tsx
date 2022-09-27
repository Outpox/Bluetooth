import { Field, ServerAPI } from 'decky-frontend-lib';
import { ReactElement, VFC } from 'react';
import { BiBluetooth } from 'react-icons/bi';
import { BsHeadphones, BsHeadset, BsController } from 'react-icons/bs';
import { Backend } from '../server';

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
    void backend.toggleDeviceConnection(device).then(value => {
      console.log(value);
      refresh();
    });
  };

  return (
    <Field
      description={device.connected
        ? <span className='connected'>CONNECTED</span>
        : <span className='disconnected'>NOT CONNECTED</span>}
      className={`no-flex-grow closer-description ${device.connected ? 'connected' : 'disconnected'}`}
      icon={getIcon()}
      onClick={toggleDeviceConnection}
    >
      <span>{device.name}</span>
    </Field>
  );
};
