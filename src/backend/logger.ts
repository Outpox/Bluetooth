const DEBUG = false; // set to true to enable verbose D-Bus logging

export const logger = {
  debug: (...args: unknown[]): void => {
    if (DEBUG) console.debug('[Bluetooth]', ...args);
  },
  error: (...args: unknown[]): void => {
    console.error('[Bluetooth]', ...args);
  },
};
