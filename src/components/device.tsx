import { Field, PanelSectionRow } from 'decky-frontend-lib';
import { ReactElement, VFC } from 'react';
import { BiBluetooth } from 'react-icons/bi';

export interface Device {
  mac: string;
  name: string;
  connected: boolean;
  icon: string;
}

const getIcon = (icon: string): ReactElement => {
  switch (icon) {
    default:
      return <BiBluetooth/>;
  }
};

export const Device: VFC<{device: Device}> = ({ device }) => (
  <PanelSectionRow>
    <Field icon={getIcon(device.icon)} >
      {device.name} - ({device.mac})
      <br />
      Connected: {device.connected ? 'yes' : 'no'}
    </Field>
  </PanelSectionRow>
);
