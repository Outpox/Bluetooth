import deckyPlugin from '@decky/rollup';
import sass from 'rollup-plugin-sass';

const buildTime = new Date().toISOString();
const buildRand = Math.random().toString(36).slice(2, 7);
const buildId = `${buildTime}-${buildRand}`;

function injectBuildId() {
  return {
    name: 'inject-build-id',
    transform(code) {
      return { code: code.replace(/__BUILD_ID__/g, JSON.stringify(buildId)), map: null };
    },
  };
}

export default deckyPlugin({
  plugins: [injectBuildId(), sass()],
});
