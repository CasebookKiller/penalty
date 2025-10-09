import { FC } from "react";

import { Calc } from "@/components/Calc/Calc";

import './StartUrlPage.css'
//import { App } from "antd";
import { CalcData, getCalcData, colors } from "@/components/Calc/common";

export interface StartUrlPageProps {
  startParam?: string;
}

export const StartUrlPage: FC<StartUrlPageProps> = (props) => {
  console.log('%cstartParam: %o', `color: ${colors.text_red}`, props.startParam);

  // цифровая запись исходных данных для калькулятора
  // необходимо преобразование в нужные данные
  let calcdata: CalcData|undefined = [
    [0,0,0,0,0],
    [0,0],
    [[[0,0]],[[0,0]]]
  ]; 
  
  calcdata = getCalcData( props.startParam || '');
  console.log('%ccalcdata: %o', `color: ${colors.text_red}`, calcdata);

  let type: number| undefined = 0; console.log(type);
  let debt = 0; console.log(debt);
  let currency = 0; console.log(currency);
  let rate = 0; console.log(rate);
  let periodtype = 0; console.log(periodtype);
  let period: [number, number] = [0,0]; console.log(period);
  let decrease: Array<[number, number]> = [[0,0]]; console.log(decrease);
  let increase: Array<[number, number]> = [[0,0]]; console.log(increase);

  if (calcdata) {
    type = calcdata[0][0];
    debt = calcdata[0][1];
    currency = calcdata[0][2];
    rate = calcdata[0][3];
    periodtype = calcdata[0][4];
    period = calcdata[1];
    decrease = calcdata[2][0];
    increase = calcdata[2][1];
  }
  
  
  return (
    <>
    <div className="contentWrapper">
      {/*<App>*/}
        <Calc 
          header={type !== 1 ?
            <>Расчет процентов по статье 395 ГК РФ</>:
            <>Расчет договорной неустойки</>
          }
          /*footer={  courtType === 'obsh' ?
            <>Расчёт размера государственной пошлины производится в соответствии со статьей 333.19 НК РФ.</>:
            <>Расчёт размера государственной пошлины производится в соответствии со статьей 333.21 НК РФ.</>
          }*/
          /*sum={sum}
          posh={String(posh)}
          setSum={(newSum) => setSum(newSum as any)} // Cast newSum to any
          setPosh={(newPosh) => setPosh(newPosh as any)} // Cast newPosh to any
          courtType={courtType}
          code={code}*/
          type={type}
          calcdata={calcdata}
        />
      {/*</App>*/}      
    </div>
    </>
  );
};
