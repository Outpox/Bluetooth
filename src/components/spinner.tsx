import { VFC } from 'react';
import { Spinner as SDSpinner } from 'decky-frontend-lib';
import { ImSpinner11 } from 'react-icons/im';

export const Spinner: VFC<{
  loading: boolean;
  refresh: () => void;
}> = ({
  loading = false,
  refresh,
}) => (loading
  ? <SDSpinner/>
  : <ImSpinner11 onClick={refresh}/>)
;
