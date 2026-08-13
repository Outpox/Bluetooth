import { definePlugin, PanelSection, PanelSectionRow, staticClasses, ToggleField, Field } from '@decky/ui';
import { useEffect, useReducer, useState } from 'react';
import equal from 'fast-deep-equal';
import { Device } from './components/device';
import { Spinner } from './components/spinner';
import { getBluetoothStatus, getPairedDevicesWithInfo, toggleBluetooth } from './server';
import { i18n } from './utils';
import { BluetoothIcon } from './components/icons';
import css from './index.scss';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function Content() {
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [devices, setDevices] = useReducer((previousValue: Device[], newValue: Device[]) => {
    if (equal(newValue, previousValue)) {
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
  const [epoch, rand] = __BUILD_ID__.split('-');
  const d = new Date(parseInt(epoch) * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const buildDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  console.log(
    '%c Bluetooth %c loaded version %s | built %s',
    'background:#1a6cf5;color:#fff;font-weight:bold;padding:1px 2px',
    'color:#fff',
    rand,
    buildDate,
  );

  return {
    title: <div className={staticClasses.Title}>Bluetooth</div>,
    content: <Content />,
    icon: <BluetoothIcon style={{ width: '1em' }} />,
  };
});
