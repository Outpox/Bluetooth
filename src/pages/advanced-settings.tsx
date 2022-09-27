import { ButtonItem, PanelSectionRow, Router, staticClasses, scrollClasses } from 'decky-frontend-lib';
import { useEffect, useState, VFC } from 'react';
import { PanelSection } from 'decky-frontend-lib';
import { Device } from '../components/device';
import { Backend } from '../server';


export const AdvancedSettings: VFC = () => {
  const backend = Backend.instance;
  const [devices, setDevices] = useState<Device[]>([]);

  const getPairedDevices = async () => {
    setDevices(await backend.getPairedDevicesWithInfo());
  };

  useEffect(() => {
    void getPairedDevices();
  }, []);

  return (
    <div className={[scrollClasses.ScrollPanel, scrollClasses.ScrollY].join(' ')}>
      <PanelSection>
        {devices.map(device => (
          <PanelSectionRow>
            <pre key={device.mac}>{JSON.stringify(device, null, 2)}</pre>
          </PanelSectionRow>
        ))}
      </PanelSection>
      <ButtonItem
        layout="below"
        onClick={() => {
          Router.NavigateBackOrOpenMenu();
        }}
      >
        Router
      </ButtonItem>
    </div>
  );
};
