import { PanelSection, PanelSectionRow } from '@decky/ui';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Device } from '../components/device';
import { getPairedDeviceWithInfo } from '../server';
import { DeviceInfoError } from '../backend/errors';

export function DeviceSettingsPage() {
  const [device, setDevice] = useState<Device>();
  const mainDiv: MutableRefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    const deviceMac = window.location.href.substring(window.location.href.length - 17);
    void getPairedDeviceWithInfo(deviceMac).then(d => {
      if (!(d instanceof DeviceInfoError)) {
        setDevice(d);
      }
    });
  }, []);

  return (
    <div ref={mainDiv} style={{ marginTop: 'var(--basicui-header-height)' }}>
      {device && (
        <PanelSection>
          <PanelSectionRow>
            <pre key={device.mac}>{JSON.stringify(device, null, 2)}</pre>
          </PanelSectionRow>
          <PanelSectionRow>Name: {device.name}</PanelSectionRow>
          <PanelSectionRow>Custom name: {device.name}</PanelSectionRow>
          <PanelSectionRow>Mac: {device.mac}</PanelSectionRow>
        </PanelSection>
      )}
    </div>
  );
}
