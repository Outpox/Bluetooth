/* eslint-disable no-useless-escape */
import { FC, SVGAttributes } from 'react';
import { IconsModule } from 'decky-frontend-lib';

export const BluetoothIcon = Object.values(IconsModule).find(
  (mod: any) => mod?.toString && /\.createElement\(\"path\",{d:\"M29.41 /.test(mod.toString()),
) as FC<SVGAttributes<SVGElement>>;

export const HeadsetIcon = Object.values(IconsModule).find(
  (mod: any) => mod?.toString && /\.createElement\(\"path\",{d:\"M32 18.05C32 /.test(mod.toString()),
) as FC<SVGAttributes<SVGElement>>;

export const GamepadIcon = Object.values(IconsModule).find(
  (mod: any) => mod?.toString && /d:\"M32.62 9.14C32.62 9.14 28.5 5 18 5C7.5 /.test(mod.toString()),
) as FC<SVGAttributes<SVGElement>>;

interface XboxControllerIconProps extends SVGAttributes<SVGElement> {
  partial?: boolean; // Partial support icon
  none?: boolean; // No support icon, if you use both none will take precedence
}

export const XboxControllerIcon = (props: XboxControllerIconProps = { none: false, partial: false }) => {
  const icon = Object.values(IconsModule).find(
    (mod: any) => mod?.toString && /d:\"M36 24.2C36 27.68 31 30 31 30L25 /.test(mod.toString()),
  ) as (props: XboxControllerIconProps) => FC<SVGAttributes<SVGElement>>;

  return <>{icon(props)}</>;
};

export const KeyboardIcon = Object.values(IconsModule).find(
  (mod: any) => mod?.toString && /d:\"M2 9H34V27H2V9ZM5 /.test(mod.toString()),
) as FC<SVGAttributes<SVGElement>>;

interface ArrowIconProps extends SVGAttributes<SVGElement> {
  direction: 'up' | 'down' | 'left' | 'right';
}
export const ArrowIcon = (props: ArrowIconProps) => {
  const icon = Object.values(IconsModule).find(
    (mod: any) => mod?.toString && /d:\"M17.98 26.54L3.20996 11.77H32.75L17.98 26.54Z/.test(mod.toString()),
  ) as (props: ArrowIconProps) => FC<SVGAttributes<SVGElement>>;

  return <>{icon(props)}</>;
};

export const SettingsIcon = Object.values(IconsModule).find(
  (mod: any) => mod?.toString && /d:\"M33 20.38V15.62L29.07 /.test(mod.toString()),
) as FC<SVGAttributes<SVGElement>>;
