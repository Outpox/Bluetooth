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
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { BiBluetooth, ImSpinner11 } from "react-icons/all";

// import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
  // const [result, setResult] = useState<number | undefined>();

  // const onClick = async () => {
  //   const result = await serverAPI.callPluginMethod<AddMethodArgs, number>(
  //     "add",
  //     {
  //       left: 2,
  //       right: 2,
  //     }
  //   );
  //   if (result.success) {
  //     setResult(result.result);
  //   }
  // };
  const status = 'WAITING'

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
            <ImSpinner11/>
          </Field>
        </PanelSectionRow>

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

const DeckyPluginRouterTest: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToStore()}>
        Go to Store
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Example Plugin</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <BiBluetooth />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
