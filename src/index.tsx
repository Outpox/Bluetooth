/// <reference types="../typings/index.d.ts"/>

import {
  definePlugin,
  Field,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  sleep,
  staticClasses,
  ToggleField,
} from 'decky-frontend-lib';
import { useEffect, useReducer, useState, VFC } from 'react';
import isEqual from 'lodash.isequal';
import { Device } from './components/device';
import { Spinner } from './components/spinner';
import { Backend } from './server';
import { i18n } from './utils';
import { BluetoothIcon } from './components/icons';

const Content: VFC<{ backend: Backend }> = ({ backend }) => {
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [devices, setDevices] = useReducer((previousValue: Device[], newValue: Device[]) => {
    if (isEqual(newValue, previousValue)) {
      return previousValue;
    }
    return newValue;
  }, []);

  SteamClient.System.Bluetooth && SteamClient.System.Bluetooth.RegisterForStateChanges(change => {
    setStatus(change.bEnabled);
  });

  const toggleBluetooth = () => {
    SteamClient.System.Bluetooth && SteamClient.System.Bluetooth.SetEnabled(!status);
  };

  const refreshStatus = async (backend: Backend, delay = 0) => {
    setLoading(true);

    await sleep(delay);
    setStatus(await backend.getBluetoothStatus());
    setDevices(await backend.getPairedDevicesWithInfo());

    setLoading(false);
  };

  useEffect(() => {
    void refreshStatus(backend, 0);
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
            onChange={toggleBluetooth}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <Field
            className="devicesTitle"
            label={i18n('Settings_Bluetooth_Devices')}>
            <Spinner loading={loading} refresh={() => refreshStatus(backend, 300)}/>
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        {devices.map(device => (
          <PanelSectionRow>
            <Device key={device.mac}
              device={device}
              backend={backend}
              refresh={() => refreshStatus(backend, 0)}
              setLoading={(state: boolean) => setLoading(state)}
            />
          </PanelSectionRow>
        ))}
      </PanelSection>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  const backend = Backend.initialize(serverApi);

  return ({
    title: <div className={staticClasses.Title}>Bluetooth</div>,
    content: <Content backend={backend} />,
    icon: <BluetoothIcon style={{ width: '1em' }}/>,
  });
});
