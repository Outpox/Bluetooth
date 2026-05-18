import { Field, Focusable, PanelSection, PanelSectionRow, ScrollPanel, staticClasses } from '@decky/ui';
import { useEffect, useState } from 'react';
import { Device } from '../components/device';
import { getPairedDeviceWithInfo } from '../server';
import { DeviceInfoError } from '../backend/errors';

interface DeviceDetails extends Device {
  original_name?: string | null;
  paired?: boolean;
  trusted?: boolean;
  blocked?: boolean;
  address_type?: string | null;
  uuids?: string[];
  rssi?: number | null;
  tx_power?: number | null;
  device_class?: number | null;
  appearance?: number | null;
}

const UUID_NAMES: Record<string, string> = {
  '0000110a-0000-1000-8000-00805f9b34fb': 'A2DP Source',
  '0000110b-0000-1000-8000-00805f9b34fb': 'A2DP Sink',
  '0000110c-0000-1000-8000-00805f9b34fb': 'AVRCP Controller',
  '0000110e-0000-1000-8000-00805f9b34fb': 'AVRCP Target',
  '0000110d-0000-1000-8000-00805f9b34fb': 'Advanced Audio',
  '00001108-0000-1000-8000-00805f9b34fb': 'Headset',
  '00001112-0000-1000-8000-00805f9b34fb': 'Headset AG',
  '0000111e-0000-1000-8000-00805f9b34fb': 'Handsfree',
  '0000111f-0000-1000-8000-00805f9b34fb': 'Handsfree AG',
  '00001124-0000-1000-8000-00805f9b34fb': 'HID',
  '00001200-0000-1000-8000-00805f9b34fb': 'PnP Information',
  '0000180a-0000-1000-8000-00805f9b34fb': 'Device Information',
  '0000180f-0000-1000-8000-00805f9b34fb': 'Battery Service',
  '00001800-0000-1000-8000-00805f9b34fb': 'Generic Access',
  '00001801-0000-1000-8000-00805f9b34fb': 'Generic Attribute',
  '00001105-0000-1000-8000-00805f9b34fb': 'OBJ Push',
  '00001106-0000-1000-8000-00805f9b34fb': 'File Transfer',
  '0000112f-0000-1000-8000-00805f9b34fb': 'Phonebook Access',
  '00001132-0000-1000-8000-00805f9b34fb': 'Message Access',
  '0000112d-0000-1000-8000-00805f9b34fb': 'SIM Access',
};

const badgeStyle = (active: boolean, danger = false): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '12px',
  fontSize: '0.8em',
  backgroundColor: danger
    ? 'rgba(244,67,54,0.25)'
    : active
      ? 'rgba(76,175,80,0.25)'
      : 'rgba(255,255,255,0.08)',
  color: danger ? '#f44336' : active ? '#4caf50' : '#67707b',
  border: `1px solid ${danger ? 'rgba(244,67,54,0.4)' : active ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
});

export function DeviceSettingsPage() {
  const [device, setDevice] = useState<DeviceDetails>();

  useEffect(() => {
    const mac = window.location.href.substring(window.location.href.length - 17);
    void getPairedDeviceWithInfo(mac).then(d => {
      if (!(d instanceof DeviceInfoError)) {
        setDevice(d as DeviceDetails);
      }
    });
  }, []);

  if (!device) return null;

  const services = (device.uuids ?? [])
    .map(uuid => UUID_NAMES[uuid.toLowerCase()] ?? uuid.slice(4, 8).toUpperCase())
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const batteryColor = device.battery == null ? '#4caf50'
    : device.battery <= 20 ? '#f44336'
    : device.battery <= 50 ? '#ff9800'
    : '#4caf50';

  const hasTechnical = device.address_type != null || device.device_class != null
    || device.appearance != null
    || (device.original_name != null && device.original_name !== device.name);

  return (
    <ScrollPanel>
    <Focusable flow-children="column" style={{ marginTop: 'var(--basicui-header-height)' }}>

      <PanelSection>
        <PanelSectionRow>
          <Field label={device.name}>
            <span style={{ color: '#67707b', fontSize: '0.85em' }}>{device.mac}</span>
          </Field>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection>
        <PanelSectionRow>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', padding: '4px 0' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className={staticClasses.PanelSectionTitle}>Status</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={badgeStyle(device.connected)}>{device.connected ? 'Connected' : 'Disconnected'}</span>
                <span style={badgeStyle(device.paired ?? false)}>{device.paired ? 'Paired' : 'Not Paired'}</span>
                <span style={badgeStyle(device.trusted ?? false)}>{device.trusted ? 'Trusted' : 'Not Trusted'}</span>
                {device.blocked && <span style={badgeStyle(false, true)}>Blocked</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              <div className={staticClasses.PanelSectionTitle}>Battery</div>
              {device.battery != null ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '14px', border: '2px solid rgba(255,255,255,0.25)', borderRight: 'none', borderRadius: '3px 0 0 3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${device.battery}%`, backgroundColor: batteryColor, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ width: '4px', height: '8px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '0 1px 1px 0', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8em', color: '#dcdedf', marginLeft: '6px' }}>{device.battery}%</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.8em', color: '#67707b' }}>Not supported</span>
              )}
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>

      {(device.rssi != null || device.tx_power != null) && (
        <PanelSection title="Signal">
          {device.rssi != null && (
            <PanelSectionRow>
              <Field label="RSSI">{device.rssi} dBm</Field>
            </PanelSectionRow>
          )}
          {device.tx_power != null && (
            <PanelSectionRow>
              <Field label="TX Power">{device.tx_power} dBm</Field>
            </PanelSectionRow>
          )}
        </PanelSection>
      )}

      {services.length > 0 && (
        <PanelSection title="Services">
          <PanelSectionRow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 0' }}>
              {services.map((s, i) => (
                <span key={i} style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.8em', color: '#dcdedf' }}>{s}</span>
              ))}
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {hasTechnical && (
        <PanelSection title="Technical">
          {device.original_name != null && device.original_name !== device.name && (
            <PanelSectionRow>
              <Field label="Device Name">{device.original_name}</Field>
            </PanelSectionRow>
          )}
          {device.address_type != null && (
            <PanelSectionRow>
              <Field label="Address Type">{device.address_type}</Field>
            </PanelSectionRow>
          )}
          {device.device_class != null && (
            <PanelSectionRow>
              <Field label="Class">0x{device.device_class.toString(16).toUpperCase().padStart(6, '0')}</Field>
            </PanelSectionRow>
          )}
          {device.appearance != null && (
            <PanelSectionRow>
              <Field label="Appearance">0x{device.appearance.toString(16).toUpperCase().padStart(4, '0')}</Field>
            </PanelSectionRow>
          )}
        </PanelSection>
      )}

    </Focusable>
    </ScrollPanel>
  );
}
