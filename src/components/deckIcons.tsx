/* eslint-disable max-len */
import { FC, SVGAttributes } from 'react';

// All icons are hardcoded SVGs to avoid the fragile IconsModule regex approach,
// which breaks when Steam's internal icon representation changes and crashes the UI.

export const BluetoothIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
  </svg>
);

export const HeadsetIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
  </svg>
);

export const GamepadIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19h0c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75h0c1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

export const KeyboardIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
  </svg>
);

export const XboxControllerIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6.5 5C4 5 2 8.13 2 12s1.5 7 4.5 7c1.38 0 2.56-.83 3.84-2.19C11.08 15.97 11.54 16 12 16s.92-.03 1.66-.19C14.94 17.17 16.12 18 17.5 18c3 0 4.5-3.13 4.5-6s-2-7-4.5-7c-1.3 0-2.66.97-3.81 2.44C12.79 7.16 12.4 7 12 7s-.79.16-1.19.44C9.66 5.97 8.3 5 6.5 5zm0 2c.61 0 1.56.62 2.47 1.78C7.72 9.72 7 11.28 7 13H5c0-2.07.47-4.66 1.5-6zM17.5 7c1.03 1.34 1.5 3.93 1.5 6h-2c0-1.72-.72-3.28-1.97-4.22C15.94 7.62 16.89 7 17.5 7zM9 10h2v1h1v2h-1v1H9v-1H8v-2h1v-1zm5.5.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
  </svg>
);

export const SettingsIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

interface ArrowIconProps extends SVGAttributes<SVGElement> {
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ARROW_ROTATIONS = { up: 0, right: 90, down: 180, left: 270 };

export const ArrowIcon: FC<ArrowIconProps> = ({ direction = 'up', style, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ transform: `rotate(${ARROW_ROTATIONS[direction]}deg)`, ...style }}
    {...props}
  >
    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
  </svg>
);
