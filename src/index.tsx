import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Field,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  sleep,
  staticClasses,
} from 'decky-frontend-lib';
import { useReducer, useState, VFC } from 'react';
import { IconType } from 'react-icons';
import { BiBluetooth, ImSpinner11 } from 'react-icons/all';
import { parseBluetoothStatus, parseDevices, parseDevicesInfo } from './utils';
import isEqual from 'lodash.isequal';
import { sleep as rsleep, parallel } from 'radash';
import { Device } from './components/device';

// import logo from "../assets/logo.png";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [status, setStatus] = useState<string>('WAITING');
  const [devices, setDevices] = useReducer((previousValue: Device[], newValue: Device[]) => {
    if (isEqual(newValue, previousValue)) {
      return previousValue;
    }
    return newValue;
  }, []);

  const refreshStatus = async (serverAPI: ServerAPI) => {
    const statusResponse = (await serverAPI.callPluginMethod('get_bluetooth_status', {})).result as string;
    setStatus(parseBluetoothStatus(statusResponse));

    const pairedDevicesResponse = (await serverAPI.callPluginMethod('get_paired_devices', {})).result as string;
    const pairedDevices = parseDevices(pairedDevicesResponse);

    const pairedDevicesWithInfoReponse = await parallel(6, pairedDevices,
      async pairedDevice => (await serverAPI.callPluginMethod('get_device_info', { device: pairedDevice.mac })).result as string);
    const pairedDevicesWithInfo = parseDevicesInfo(pairedDevicesWithInfoReponse);
    console.log('pairedDevicesWithInfo: ', pairedDevicesWithInfo);
    setDevices(pairedDevicesWithInfo);
  };

  void refreshStatus(serverAPI);

  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
      #QuickAccess-Menu > div[class^="quickaccessmenu_Menu_"].Panel.Focusable >
      div[class^="quickaccessmenu_PanelOuterNav_"].Panel.Focusable >
      div > div[class^="quickaccessmenu_ContentTransition_"][class*="quickaccessmenu_ActiveTab_"] >
      div > div[class^="quickaccessmenu_Title_"] > div {
        /* Force plugin title to be on a single line */
        flex-grow: 1 !important;
      }
      .status, .devicesTitle {
        color: #dcdedf;
      }
      .devicesTitle {

      }
    ` }} />
      <PanelSection>
        <PanelSectionRow>
          <Field
            icon={<BiBluetooth />}
            className="status"
          >
            <span>Bluetooth status: {status}</span>
          </Field>
        </PanelSectionRow>

        <PanelSectionRow>
          <Field
            className="devicesTitle"
            label="Paired devices">
            <ImSpinner11 onClick={() => refreshStatus(serverAPI)}/>
          </Field>
        </PanelSectionRow>

        {devices.map(device => (
          <Device device={device} />
        ))}

        {/* <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => {}}>
                <MenuItem onSelected={() => {}}>Item #1</MenuItem>
                <MenuItem onSelected={() => {}}>Item #2</MenuItem>
                <MenuItem onSelected={() => {}}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says yolo
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/decky-plugin-test");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow> */}
      </PanelSection>
    </div>
  );
};

// const DeckyPluginRouterTest: VFC = () => (
//   <div style={{ marginTop: '50px', color: 'white' }}>
//       Hello World!
//     <DialogButton onClick={() => Router.NavigateToStore()}>
//         Go to Store
//     </DialogButton>
//   </div>
// );

export default definePlugin((serverApi: ServerAPI) =>
// serverApi.routerHook.addRoute('/decky-plugin-test', DeckyPluginRouterTest, {
//   exact: true,
// });

  ({
    title: <div className={staticClasses.Title}>SDH-Bluetooth</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <BiBluetooth />,
    // onDismount() {
    // serverApi.routerHook.removeRoute('/decky-plugin-test');
    // },
  })
);
