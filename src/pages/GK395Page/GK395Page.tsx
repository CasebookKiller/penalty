import { FC } from 'react';
import './GK395Page.css';

import { Calc } from '@/components/Calc/Calc';

export const GK395Page: FC = () => {
  return (
    <div className="GK395Page">
      <Calc 
        title={'Расчет процентов по статье 395 ГК РФ'}
      />
    </div>
  );
};
