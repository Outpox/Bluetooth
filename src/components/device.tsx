import { Field, Router } from 'decky-frontend-lib';
import { MouseEventHandler, MutableRefObject, ReactElement, useEffect, useRef, VFC } from 'react';
import { Backend } from '../server';
import { i18n } from '../utils';
import { BluetoothIcon, GamepadIcon, HeadsetIcon } from './icons';

export interface Device {
  mac: string;
  name: string;
  connected: boolean;
  icon: string;
}

export const Device: VFC<{
  device: Device;
  backend: Backend;
  refresh: () => void;
  setLoading: (state: boolean) => void;
}> = ({
  device,
  backend,
  refresh,
  setLoading,
}) => {
  const iconStyle: React.CSSProperties = {
    transform: 'translateY(10px)',
  };
  const getIcon = (): ReactElement => {
    switch (device.icon) {
      case 'input-gaming':
        return <GamepadIcon style={iconStyle}/>;
      case 'audio-headset':
        return <HeadsetIcon style={iconStyle}/>;
      case 'audio-headphones':
        return <HeadsetIcon style={iconStyle}/>;
      default:
        return <BluetoothIcon style={iconStyle}/>;
    }
  };

  const longPress = useRef(false);
  const timer: MutableRefObject<NodeJS.Timeout|undefined> = useRef();

  const startTimer = () => {
    longPress.current = false;
    timer.current = setTimeout(() => {
      longPress.current = true;
      handleLongPress();
    }, 500);
  };

  const stopTimer = () => {
    clearTimeout(timer.current);
  };

  const handleClick: MouseEventHandler = e => {
    if (e.type === 'vgp_onok') {
      e.preventDefault();
      return;
    }
    setLoading(true);
    void backend.toggleDeviceConnection(device).then(refresh);
  };

  const handleLongPress = () => {
    Router.Navigate('/device-settings/' + device.mac);
  };

  type vgp_event = Event & {
    detail: {
      button: number;
      source: number;
      is_repeat: boolean|undefined;
    };
  }

  const elementRef: MutableRefObject<HTMLDivElement|null> = useRef(null);
  useEffect(() => {
    elementRef.current?.addEventListener('vgp_onbuttondown', e => {
      const se = e as vgp_event;
      if (se.detail.button === 1) {
        startTimer();
      }
    });
    elementRef.current?.addEventListener('vgp_onbuttonup', e => {
      const se = e as vgp_event;
      if (se.detail.button === 1) {
        stopTimer();
        if (!longPress.current) {
          handleClick(e as any);
        }
      }
    });
  }, []);

  return (
    <Field
      ref={elementRef}
      description={device.connected
        ? <span className='connected uppercase'>{i18n('Settings_Bluetooth_Connected')}</span>
        : <span className='disconnected uppercase'>{i18n('Settings_Bluetooth_NotConnected')}</span>}
      className={`no-flex-grow closer-description ${device.connected ? 'connected' : 'disconnected'}`}
      icon={getIcon()}
      onClick={handleClick}
      onTouchStart={startTimer}
      onTouchEnd={stopTimer}
      onMouseDown={startTimer}
      onMouseUp={stopTimer}
    >
      <span>{device.name}</span>
    </Field>
  );
};
