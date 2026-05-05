import { DialogButton, Spinner as SDSpinner } from '@decky/ui';
import { ImSpinner11 } from 'react-icons/im';

export function Spinner({
  loading = false,
  refresh,
}: {
  loading: boolean;
  refresh: () => void;
}) {
  const style: React.CSSProperties = {
    minWidth: 0,
    padding: '6px 6px 2px 6px',
    borderRadius: '50%',
  };

  return (
    loading ?
      <SDSpinner style={{ padding: '4px 4px 2px 0' }}/> :
      <DialogButton
        style={style}
        onOKButton={refresh}
        onClick={refresh}>
        <ImSpinner11/>
      </DialogButton>
  );
}
