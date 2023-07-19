/* eslint-disable no-useless-escape */
import { FC, SVGAttributes } from 'react';
import { IconsModule } from 'decky-frontend-lib';

export const BluetoothIcon = Object.values(IconsModule).find((mod: any) =>
  mod?.toString && /\.createElement\(\"path\",{d:\"M29.41 /.test(mod.toString())
) as FC<SVGAttributes<SVGElement>>;

export const HeadsetIcon = Object.values(IconsModule).find((mod: any) =>
  mod?.toString && /\.createElement\(\"path\",{d:\"M32 18.05C32 /.test(mod.toString())
) as FC<SVGAttributes<SVGElement>>;

export const GamepadIcon = Object.values(IconsModule).find((mod: any) =>
  mod?.toString && /d:\"M32.62 9.14C32.62 9.14 28.5 5 18 5C7.5 /.test(mod.toString())
) as FC<SVGAttributes<SVGElement>>;

export const KeyboardIcon = Object.values(IconsModule).find((mod: any) =>
  mod?.toString && /d:\"M2 9H34V27H2V9ZM5 /.test(mod.toString())
) as FC<SVGAttributes<SVGElement>>;
