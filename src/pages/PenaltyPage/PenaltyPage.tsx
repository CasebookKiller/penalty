import { FC } from 'react';
import './PenaltyPage.css';

import { Calc } from '@/components/Calc/Calc';

export const PenaltyPage: FC = () => {

  return (
    <div className="PenaltyPage">
      <Calc 
        title={'Расчет договорной неустойки'} 
      />
    </div>
  );
};
