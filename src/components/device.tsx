import { Field } from 'decky-frontend-lib';
import { ReactElement, VFC } from 'react';
import { BiBluetooth } from 'react-icons/bi';
import { BsHeadphones, BsHeadset, BsController } from 'react-icons/bs';

export interface Device {
  mac: string;
  name: string;
  connected: boolean;
  icon: string;
}

const getIcon = (icon: string): ReactElement => {
  switch (icon) {
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

export const Device: VFC<{device: Device}> = ({ device }) => (
  <Field
    description={device.connected
      ? <span className='connected'>CONNECTED</span>
      : <span className='disconnected'>NOT CONNECTED</span>}
    className={`no-flex-grow closer-description ${device.connected ? 'connected' : 'disconnected'}`}
    icon={getIcon(device.icon)}>
    <span>{device.name}</span>
  </Field>
);
