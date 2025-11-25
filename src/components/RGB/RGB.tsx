import { type RGB as RGBType } from '@telegram-apps/sdk-react';
import type { FC, JSX } from 'react';
import { classNames } from 'primereact/utils';

import './RGB.css';

export type RGBProps = JSX.IntrinsicElements['div'] & {
  color: RGBType;
};

export const RGB: FC<RGBProps> = ({ color, className, ...rest }) => (
  <span {...rest} className={classNames('rgb', className)}>
    <i className='rgb__icon' style={{ backgroundColor: color }}/>
    {color}
  </span>
);
