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
import { useEffect, useReducer, useState, VFC } from 'react';
import { BiBluetooth } from 'react-icons/all';
import { parseBluetoothStatus, parseDevices, parseDevicesInfo } from './utils';
import isEqual from 'lodash.isequal';
import { Device } from './components/device';
import { Spinner } from './components/spinner';

// import logo from "../assets/logo.png";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [status, setStatus] = useState<string>('LOADING');
  const [loading, setLoading] = useState<boolean>(false);
  const [devices, setDevices] = useReducer((previousValue: Device[], newValue: Device[]) => {
    if (isEqual(newValue, previousValue)) {
      return previousValue;
    }
    return newValue;
  }, []);

  const refreshStatus = async (serverAPI: ServerAPI) => {
    setLoading(true);
    setStatus('LOADING');
    const statusResponse = (await serverAPI.callPluginMethod('get_bluetooth_status', {})).result as string;

    const pairedDevicesResponse = (await serverAPI.callPluginMethod('get_paired_devices', {})).result as string;
    const pairedDevices = parseDevices(pairedDevicesResponse);

    const pairedDevicesWithInfoReponse = await Promise.all(pairedDevices.map(
      async pairedDevice => (await serverAPI.callPluginMethod('get_device_info', { device: pairedDevice.mac })).result as string)
    );
    const pairedDevicesWithInfo = parseDevicesInfo(pairedDevicesWithInfoReponse);
    console.log('pairedDevicesWithInfo: ', pairedDevicesWithInfo);

    await sleep(300);
    setStatus(parseBluetoothStatus(statusResponse));
    setDevices(pairedDevicesWithInfo);
    setLoading(false);
  };

  useEffect(() => {
    void refreshStatus(serverAPI);
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

      #bluetooth div[class^="quickaccesscontrols_PanelSection_"] {
        margin-bottom: 0;
      }

      .status, .devicesTitle, .connected {
        color: #dcdedf;
      }

      .disconnected {
        color: #67707b;
      }

      /* Force Fields content to be left aligned */
      .no-flex-grow > div[class^="gamepaddialog_FieldLabelRow_"] {
        justify-content: flex-start;
      }
      .no-flex-grow > div[class^="gamepaddialog_FieldLabelRow_"] > div[class^="gamepaddialog_FieldLabel_"] {
        flex-grow: 0;
      }

      .closer-description > div[class^="gamepaddialog_FieldDescription_"] {
        margin-top: 0;
        margin-left: calc(32px + var(--field-row-children-spacing));
      }
    ` }} />
      <PanelSection>
        <PanelSectionRow>
          <Field
            icon={<BiBluetooth />}
            className="status no-flex-grow"
          >
            <span>Bluetooth status: {status}</span>
          </Field>
        </PanelSectionRow>

        <PanelSectionRow>
          <Field
            className="devicesTitle"
            label="Paired devices">
            <Spinner loading={loading} refresh={() => refreshStatus(serverAPI)}/>
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        {devices.map(device => (
          <PanelSectionRow>
            <Device device={device} key={device.mac} />
          </PanelSectionRow>
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
