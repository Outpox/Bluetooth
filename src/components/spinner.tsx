import { DialogButton } from '@decky/ui';
import { useEffect, useRef, useState } from 'react';
import { ImSpinner11 } from 'react-icons/im';

export function Spinner({ loading = false, refresh }: { loading: boolean; refresh: () => void }) {
  const style: React.CSSProperties = {
    minWidth: 0,
    padding: '6px 6px 2px 6px',
    borderRadius: '50%',
  };

  const [spinning, setSpinning] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  useEffect(() => {
    if (loading) {
      setSpinning(true);
    }
  }, [loading]);

  // A refresh usually ends mid-turn, and dropping the animation there snaps the
  // icon back to its start. Keep it until the running turn reaches its end.
  useEffect(() => {
    const node = iconRef.current;
    if (!node || !spinning) {
      return;
    }
    const stopWhenIdle = () => {
      if (!loadingRef.current) {
        setSpinning(false);
      }
    };
    node.addEventListener('animationiteration', stopWhenIdle);
    return () => node.removeEventListener('animationiteration', stopWhenIdle);
  }, [spinning]);

  // The button stays mounted while loading and only its icon spins. Swapping it
  // for a standalone spinner unmounted the focused element, which dropped the
  // gamepad focus to the body and left the panel with no highlight.
  const handle = () => {
    if (!loading) {
      refresh();
    }
  };

  return (
    <DialogButton style={style} onOKButton={handle} onClick={handle}>
      <span ref={iconRef} className={spinning ? 'refresh-icon spinning' : 'refresh-icon'}>
        <ImSpinner11 />
      </span>
    </DialogButton>
  );
}
