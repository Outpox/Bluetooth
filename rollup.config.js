import deckyPlugin from '@decky/rollup';
import sass from 'rollup-plugin-sass';

export default deckyPlugin({
  plugins: [sass()],
});
