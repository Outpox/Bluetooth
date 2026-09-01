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

const BATTERY_SETTLE_TRIES = 5;
const BATTERY_SETTLE_INTERVAL = 1000;

function Content() {
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [devices, setDevices] = useReducer((previousValue: Device[] | null, newValue: Device[] | null) => {
    if (equal(newValue, previousValue)) {
      return previousValue;
    }
    return newValue;
  }, null);
  // Held here rather than in the rows, so a refresh can clear them all.
  const [failedMacs, setFailedMacs] = useState<string[]>([]);

  const handleToggleBluetooth = () => {
    void toggleBluetooth(status).finally(() => {
      void refreshStatus(0);
    });
  };

  const refreshStatus = async (delay = 0) => {
    setLoading(true);
    setFailedMacs([]);
    await sleep(delay);
    setStatus(await getBluetoothStatus());
    setDevices(await getPairedDevicesWithInfo());
    setLoading(false);
  };

  // BlueZ registers org.bluez.Battery1 on the device object a moment after the
  // Connect call returns, so the refresh that follows a connect reads no battery
  // yet. Re-read a few times until it appears. Each read costs a few ms.
  const settleBattery = async (mac: string) => {
    for (let attempt = 0; attempt < BATTERY_SETTLE_TRIES; attempt++) {
      await sleep(BATTERY_SETTLE_INTERVAL);
      const list = await getPairedDevicesWithInfo();
      setDevices(list);
      const device = list?.find(d => d.mac === mac);
      if (!device?.connected || device.battery != null) {
        return;
      }
    }
  };

  const handleDeviceResult = (mac: string, ok: boolean, wasConnected: boolean) => {
    setFailedMacs(previous => (ok ? previous.filter(m => m !== mac) : [...previous.filter(m => m !== mac), mac]));
    if (ok && !wasConnected) {
      void settleBattery(mac);
    }
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
        {!loading && devices === null && (
          <PanelSectionRow>
            <div className="no-devices">{i18n('Settings_Bluetooth_Unavailable', 'Bluetooth is unavailable')}</div>
          </PanelSectionRow>
        )}
        {!loading && devices?.length === 0 && (
          <PanelSectionRow>
            <div className="no-devices">
              {i18n('QuickAccess_Tab_Bluetooth_Section_Devices_NonePaired', 'No devices paired')}
            </div>
          </PanelSectionRow>
        )}
        {devices?.map(device => (
          <Device
            key={device.mac}
            device={device}
            enabled={status}
            failed={failedMacs.includes(device.mac)}
            refresh={() => refreshStatus(0)}
            setLoading={(state: boolean) => setLoading(state)}
            onResult={handleDeviceResult}
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
