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
import { BluetoothIcon } from './components/deckIcons';
import { DevicePage } from './pages/device';
import css from './index.scss';

const Content: VFC<{ backend: Backend }> = ({ backend }) => {
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [devices, setDevices] = useReducer((previousValue: Device[], newValue: Device[]) => {
    if (isEqual(newValue, previousValue)) {
      return previousValue;
    }
    return newValue;
  }, []);

  try {
    SteamClient.System.Bluetooth.RegisterForStateChanges(change => {
      setStatus(change.bEnabled);
    });
  } catch (error) {
    console.warn('SteamClient.System.Bluetooth unavailable, cannot monitor bluetooth for change');
  }

  const toggleBluetooth = (backend: Backend) => {
    try {
      void SteamClient.System.Bluetooth.SetEnabled(!status);
    } catch (error) {
      backend.toggleBluetooth(status).finally(() => {
        void refreshStatus(backend, 0);
      });
    }
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
      <style dangerouslySetInnerHTML={{ __html: css }}/>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label='Bluetooth'
            checked={status}
            onChange={() => toggleBluetooth(backend)}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <Field
            className="devicesTitle"
            label={i18n('Settings_Bluetooth_Devices')}>
            <Spinner loading={loading} refresh={() => refreshStatus(backend, 300)} />
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        {devices.map(device => (
          <Device key={device.mac}
            device={device}
            backend={backend}
            refresh={() => refreshStatus(backend, 0)}
            setLoading={(state: boolean) => setLoading(state)}
          />
        ))}
      </PanelSection>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  const backend = Backend.initialize(serverApi);
  const DeviceSettingsRoute = '/device-settings/:deviceMac';

  serverApi.routerHook.addRoute(DeviceSettingsRoute, DevicePage);

  return ({
    title: <div className={staticClasses.Title}>Bluetooth</div>,
    content: <Content backend={backend} />,
    icon: <BluetoothIcon style={{ width: '1em' }} />,
    onDismount() {
      serverApi.routerHook.removeRoute(DeviceSettingsRoute);
    },
  });
});
