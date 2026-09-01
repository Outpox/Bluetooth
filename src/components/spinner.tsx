import { DialogButton } from '@decky/ui';
import { ImSpinner11 } from 'react-icons/im';

export function Spinner({ loading = false, refresh }: { loading: boolean; refresh: () => void }) {
  const style: React.CSSProperties = {
    minWidth: 0,
    padding: '6px 6px 2px 6px',
    borderRadius: '50%',
  };

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
      <ImSpinner11 className={loading ? 'refresh-icon spinning' : 'refresh-icon'} />
    </DialogButton>
  );
}
