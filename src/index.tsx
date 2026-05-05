import {
  definePlugin,
  Field,
  PanelSection,
  PanelSectionRow,
  staticClasses,
  ToggleField,
} from '@decky/ui';
import { useEffect, useReducer, useState } from 'react';
import isEqual from 'lodash.isequal';
import { Device } from './components/device';
import { Spinner } from './components/spinner';
import { getBluetoothStatus, getPairedDevicesWithInfo, toggleBluetooth } from './server';
import { i18n } from './utils';
import { BluetoothIcon } from './components/icons';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function Content() {
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [devices, setDevices] = useReducer((previousValue: Device[], newValue: Device[]) => {
    if (isEqual(newValue, previousValue)) {
      return previousValue;
    }
    return newValue;
  }, []);

  const handleToggleBluetooth = () => {
    void toggleBluetooth(status).finally(() => {
      void refreshStatus(0);
    });
  };

  const refreshStatus = async (delay = 0) => {
    setLoading(true);

    await sleep(delay);
    setStatus(await getBluetoothStatus());
    setDevices(await getPairedDevicesWithInfo());

    setLoading(false);
  };

  useEffect(() => {
    void refreshStatus(0);
  }, []);

  return (
    <div id='bluetooth'>
      <style dangerouslySetInnerHTML={{
        __html: `
      #QuickAccess-Menu > div[class^="quickaccessmenu_Menu_"].Panel.Focusable >
      div[class^="quickaccessmenu_PanelOuterNav_"].Panel.Focusable >
      div > div[class^="quickaccessmenu_ContentTransition_"][class*="quickaccessmenu_ActiveTab_"] >
      div > div[class^="quickaccessmenu_Title_"] > div {
        /* Force plugin title to be on a single line */
        flex-grow: 1 !important;
      }

      #bluetooth > div {
        margin-bottom: 0;
      }

      .uppercase {
        text-transform: uppercase;
      }
      
      .status, .devicesTitle, .connected {
        color: #dcdedf;
      }

      .disconnected {
        color: #67707b;
      }

      .device > div:first-child {
        justify-content: flex-start;
      }
      .device > div > div:first-child {
        max-width: 32px;
      }
    ` }} />
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label='Bluetooth'
            checked={status}
            onChange={handleToggleBluetooth}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <Field
            className="devicesTitle"
            label={i18n('Settings_Bluetooth_Devices')}>
            <Spinner loading={loading} refresh={() => refreshStatus(300)}/>
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        {devices.map(device => (
          <PanelSectionRow key={device.mac}>
            <Device
              device={device}
              refresh={() => refreshStatus(0)}
              setLoading={(state: boolean) => setLoading(state)}
            />
          </PanelSectionRow>
        ))}
      </PanelSection>
    </div>
  );
}

export default definePlugin(() => {
  return {
    title: <div className={staticClasses.Title}>Bluetooth</div>,
    content: <Content />,
    icon: <BluetoothIcon style={{ width: '1em' }}/>,
  };
});
