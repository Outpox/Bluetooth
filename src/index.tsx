import { definePlugin, PanelSection, PanelSectionRow, staticClasses, ToggleField, Field } from '@decky/ui';
import { routerHook } from '@decky/api';
import { useEffect, useReducer, useState } from 'react';
import isEqual from 'lodash.isequal';
import { Device } from './components/device';
import { Spinner } from './components/spinner';
import { getBluetoothStatus, getPairedDevicesWithInfo, toggleBluetooth } from './server';
import { i18n } from './utils';
import { BluetoothIcon } from './components/icons';
import { DeviceSettingsPage } from './pages/deviceSettings';
import css from './index.scss';

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
    <div id="bluetooth">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PanelSection>
        <PanelSectionRow>
          <ToggleField label="Bluetooth" checked={status} onChange={handleToggleBluetooth} />
        </PanelSectionRow>

        <PanelSectionRow>
          <Field className="devicesTitle" label={i18n('Settings_Bluetooth_Devices')}>
            <Spinner loading={loading} refresh={() => refreshStatus(300)} />
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        {devices.map(device => (
          <Device
            key={device.mac}
            device={device}
            refresh={() => refreshStatus(0)}
            setLoading={(state: boolean) => setLoading(state)}
          />
        ))}
      </PanelSection>
    </div>
  );
}

export default definePlugin(() => {
  const DeviceSettingsRoute = '/device-settings/:deviceMac';
  routerHook.addRoute(DeviceSettingsRoute, DeviceSettingsPage);

  return {
    title: <div className={staticClasses.Title}>Bluetooth</div>,
    content: <Content />,
    icon: <BluetoothIcon style={{ width: '1em' }} />,
    onDismount() {
      routerHook.removeRoute(DeviceSettingsRoute);
    },
  };
});
