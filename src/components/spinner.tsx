import { VFC } from 'react';
import { DialogButton, Spinner as SDSpinner } from 'decky-frontend-lib';
import { ImSpinner11 } from 'react-icons/all';

export const Spinner: VFC<{
  loading: boolean;
  refresh: () => void;
}> = ({
  loading = false,
  refresh,
}) => {
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
;
