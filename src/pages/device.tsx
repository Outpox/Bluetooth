import { ButtonItem, PanelSectionRow, Router, scrollClasses, SidebarNavigation } from 'decky-frontend-lib';
import { MutableRefObject, useEffect, useRef, useState, VFC } from 'react';
import { PanelSection } from 'decky-frontend-lib';
import { Device } from '../components/device';
import { Backend } from '../server';


// export const DevicePage: VFC<{device: Device}> = ({ device }) => {
export const DevicePage: VFC = () => {
  const backend = Backend.instance;
  const [device, setDevice] = useState<Device>();
  const mainDiv: MutableRefObject<HTMLDivElement|null> = useRef(null);

  useEffect(() => {
    const deviceMac = window.location.href.substring(window.location.href.length - 17);
    void backend.getPairedDeviceWithInfo(deviceMac).then(d => {
      console.log('d: ', d);
      setDevice(d);
      Router.CloseSideMenus();
    });
  }, []);

  return (
    <div ref={mainDiv} style={{ marginTop: 'var(--basicui-header-height)' }}>
      {device &&
      <PanelSection>
        <PanelSectionRow>
          <pre key={device.mac}>{JSON.stringify(device, null, 2)}</pre>
        </PanelSectionRow>
        <PanelSectionRow>
          Name: {device.name}
        </PanelSectionRow>
        <PanelSectionRow>
          Custom name: {device.name}
        </PanelSectionRow>
        <PanelSectionRow>
          Mac: {device.mac}
        </PanelSectionRow>
      </PanelSection>
      }
    </div>
  );
};
