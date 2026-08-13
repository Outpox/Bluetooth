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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="currentColor" {...props}>
    <path
      d="M32 18.05C32 14.337 30.525 10.7761 27.8995 8.15055C25.274 5.52504 21.713 4.05005 18 4.05005C14.287 4.05005 10.726 5.52504 8.1005 8.15055C5.475 10.7761 4 14.337 4 18.05C4.00415 18.94 4.09457 19.8275 4.27 20.7001C4.27 20.7001 4.93 25.78 10 32.05L15 29.05L12 21.05H8.47C8.15762 20.0807 7.99903 19.0685 8 18.05C8 15.3979 9.05357 12.8543 10.9289 10.979C12.8043 9.10362 15.3478 8.05005 18 8.05005C20.6522 8.05005 23.1957 9.10362 25.0711 10.979C26.9464 12.8543 28 15.3979 28 18.05C28.001 19.0685 27.8424 20.0807 27.53 21.05H24L21 29.05L26 32.05C31.07 25.78 31.74 20.7001 31.74 20.7001C31.9121 19.8272 31.9991 18.9397 32 18.05Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const GamepadIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="currentColor" {...props}>
    <path
      fill="currentColor"
      d="M31.5,9.6c-0.3-0.3-0.7-0.6-1.1-1V8.4c0,0,0-0.6-0.6-1.1s-3.9-1.7-5.1-1.7c-0.7,0-0.9,0.2-1.2,0.4c-0.2,0.1-0.3,0.2-0.5,0.2  H12.9c-0.2,0-0.4-0.1-0.5-0.2c-0.2-0.2-0.5-0.4-1.2-0.4c-1.1,0-4.5,1.1-5.1,1.7S5.6,8.4,5.6,8.4v0.1c-0.4,0.3-0.8,0.7-1.1,1  C3.4,10.7,0,20.2,0,25.3s3.4,5.6,3.4,5.6c0.9,0,2.3-1.8,3.7-3.5c1.2-1.5,2.3-3,3.1-3.2c1.7-0.6,14.1-0.6,15.8,0  c0.8,0.3,1.9,1.7,3.1,3.2c1.4,1.7,2.8,3.5,3.7,3.5c0,0,3.4-0.6,3.4-5.6S32.6,10.7,31.5,9.6z M8.4,14.6c-1.2,0-2.2-1-2.2-2.2  s1-2.2,2.2-2.2s2.2,1,2.2,2.2S9.7,14.6,8.4,14.6z M15.8,18.8c0,0.3-0.3,0.6-0.6,0.6h-0.8v0.8c0,0.3-0.3,0.6-0.6,0.6h-1.1  c-0.3,0-0.6-0.3-0.6-0.6v-0.8h-0.8c-0.3,0-0.6-0.3-0.6-0.6v-1.1c0-0.3,0.3-0.6,0.6-0.6h0.8v-0.8c0-0.3,0.3-0.6,0.6-0.6h1.1  c0.3,0,0.6,0.3,0.6,0.6v0.8h0.8c0.3,0,0.6,0.3,0.6,0.6V18.8z M27.6,8.7c0.8,0,1.4,0.6,1.4,1.4s-0.6,1.4-1.4,1.4s-1.4-0.6-1.4-1.4  S26.8,8.7,27.6,8.7z M23.1,20.2c-1.2,0-2.2-1-2.2-2.2s1-2.2,2.2-2.2s2.2,1,2.2,2.2S24.3,20.2,23.1,20.2z M25,14.1  c-0.8,0-1.4-0.6-1.4-1.4c0-0.8,0.6-1.4,1.4-1.4s1.4,0.6,1.4,1.4C26.4,13.4,25.8,14.1,25,14.1z M27.6,16.6c-0.8,0-1.4-0.6-1.4-1.4  s0.6-1.4,1.4-1.4s1.4,0.6,1.4,1.4S28.3,16.6,27.6,16.6z M30.1,14.1c-0.8,0-1.4-0.6-1.4-1.4c0-0.8,0.6-1.4,1.4-1.4s1.4,0.6,1.4,1.4  C31.5,13.4,30.9,14.1,30.1,14.1z"
    ></path>
  </svg>
);

export const KeyboardIcon: FC<SVGAttributes<SVGElement>> = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
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
