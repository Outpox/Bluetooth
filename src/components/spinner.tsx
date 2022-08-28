import { VFC } from 'react';
import { Spinner as SDSpinner } from 'decky-frontend-lib';
import { ImSpinner11 } from 'react-icons/all';

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
