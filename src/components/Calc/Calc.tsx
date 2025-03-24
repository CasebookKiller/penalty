
import * as RU from '../../locale/ru.json';
import * as compressJSON from 'compress-json';

import * as jsoncrush from 'jsoncrush';

import { dateFromString, getDayOfYear, getDays, doKeyRatesTable } from './functions';

import { FC, useEffect, useState } from 'react';

import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import './Calc.css';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import { addLocale, locale, PrimeReactProvider } from 'primereact/api';
import { AppSection } from '../AppSection/AppSection';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { classNames } from 'primereact/utils';

//import { segodnya } from './functions';
addLocale('ru', RU.ru);
locale('ru');
    
interface CalcProps {
  type?: number; // 0 - 395, 1 - penalty
}

interface DebtRow {
  id: number;
  date: Date;
  sum: number;
}

interface ShortDebtRow {
  d: Date;
  s: number;
}

interface CalcData {
  s: [number | undefined, number, number, number, number];
  d: [Date | null, Date | null];
  p: [ShortDebtRow[], ShortDebtRow[]];
  //type: number | undefined;
  //debt: number;
  //currency: number;
  //rate: number;
  //periodtype: number;
  //from: Date | null;
  //to: Date | null;
  //debtdecrease: DebtRow[];
  //debtincrease: DebtRow[];
}

interface MainTableRow {
  id: number;
  date: Date;
  in?: number;
  inc?: number;
  dec?: number;
  out?: number; 
  percent?: number;
  penalty?: number;
}

interface ShortTableRow {
  s: Date;
  e: Date;
  i?: number;
  inc?: number;
  dec?: number;
  o?: number; 
  pcnt?: number;
  plty?: number;
}

const debtdecrease = [
  // после отладки удалить
  { id: 1, date: dateFromString('11.02.2025'), sum: 1000 },
  { id: 2, date: dateFromString('11.03.2025'), sum: 2000 },
  { id: 3, date: dateFromString('11.04.2025'), sum: 3000 },
];

const debtincrease = [
  // после отладки удалить
  { id: 1, date: dateFromString('12.02.2025'), sum: 3000 },
  { id: 2, date: dateFromString('12.03.2025'), sum: 2000 },
  { id: 3, date: dateFromString('12.04.2025'), sum: 1000 },
];

const keyratesTable = doKeyRatesTable(); // ключевые ставки по дням
console.log(keyratesTable);

export const Calc: FC<CalcProps> = ({type}) => {
  const title = type !== 1 ? 'Расчет процентов по статье 395 ГК РФ': 'Расчет договорной неустойки';
  const [debt, setDebt] = useState<number>(0);
  const [currency, setCurrency] = useState(1); // 1 - RUB, 2 - USD, 3 - EUR
  const [datefrom, setDateFrom] = useState(null);
  const [dateto, setDateTo] = useState(null);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [rate, setRate] = useState(0);
  const [periodtype, setPeriodType] = useState(1); // 1 - День, 2 - Год

  // Платежи в погашение долга
  const [DebtDecrease, setDebtDecrease] = useState<DebtRow[]>(debtdecrease);

  // Увеличение долга
  const [DebtIncrease, setDebtIncrease] = useState<DebtRow[]>(debtincrease);

  // usestate
  const [Rows, setRows] = useState<ShortTableRow[]>(); // текущая группа
  
  const [sum, setSum] = useState(0);

  function getCalcData(): CalcData {
    const decrease = DebtDecrease.map((item) => {
      return {
        d: item.date,
        s: item.sum,        
      }}
    );
    const increase = DebtIncrease.map((item) => {
      return {
        d: item.date,
        s: item.sum,        
      }}
    );

    return {
      s: [type, debt, currency, rate, periodtype],
      d: [datefrom, dateto],
      p: [decrease, increase],
    };
  }

  useEffect(() => {
    if (datefrom && dateto) {
      const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
      //setMainTable(newMainTable);
      const newShortTable = doShortTable(newMainTable);
      const calcData = getCalcData();
      console.log(calcData);
      const compressed = compressJSON.compress(calcData);
      console.log('compressed: ', compressed);
      console.log('stringify: ',JSON.stringify(compressed));
      console.log('length: ', JSON.stringify(compressed).length)
      console.log('crush: ', jsoncrush.default.crush(JSON.stringify(compressed)));
      console.log('length: ', jsoncrush.default.crush(JSON.stringify(compressed)).length)
      setRows(newShortTable);
    }
  }, [debt, datefrom, dateto, rate, periodtype]);
  
  useEffect(() => {
    console.log('rate', rate);
    console.log('periodtype', periodtype);
  }, [rate, periodtype]);

  const currencies = [
    { name: '₽', value: 1, text: 'Российский рубль', eng: 'RUB', rus: 'руб.' },
    { name: '$', value: 2, text: 'Доллар США', eng: 'USD', rus: 'долл.' },
    { name: '€', value: 3, text: 'Евро', eng: 'EUR', rus: 'евро' },
  ];

  const periodtypes = [
    {
      name: 'В день',
      value: 1,
    },
    {
      name: 'В год',
      value: 2,
    }
  ]


  function getMaxDebtRowId( array: DebtRow[] ) {
    let maxId = 0;
    for (let i = 0; i < array.length; i++) if (array[i].id > maxId) maxId = array[i].id;
    return maxId;
  }

  function doShortTable(mainTable: MainTableRow[]) {
    
    let currentShortRow: ShortTableRow | null = null; // текущая строка
    let lastShortRow: ShortTableRow | null = null; // предыдущая строка в группе
    let lastRow: MainTableRow | null = null; // предыдущая строка главной тааблицы

    let rows: ShortTableRow[] = [];


    mainTable.map((row, index, array) => {
      //lastRow && console.log(lastRow);
      //console.log('%crow: ', 'color: cyan', row);
      //console.log(row.penalty);
      //if (!lastShortRow) console.log(lastShortRow);
      
      // проверка на изменение ключевых параметров
      const setNewShortRow = 
            lastRow?.in !== row.in || 
            lastRow?.out !== row.out || 
            lastRow?.percent !== row.percent;

      if (setNewShortRow) {
        //console.log('%cключевые параметры изменились','color: pink');
        currentShortRow = {
          s: row.date,
          e: row.date,
          i: row.in,
          inc: row.inc,
          dec: row.dec,
          o: row.out,
          pcnt: row.percent,
          plty: row.penalty  
        } as ShortTableRow;
        if (lastShortRow) {
          rows.push(lastShortRow);
        } else {
          //console.log('%clastShortRow: %o', 'color: yellow', lastShortRow);
        }
      } else {
        //console.log('без изменений');
        if (!currentShortRow) return;
        const penalty = row.penalty === undefined ? 0 : row.penalty;
        const sumPenalty = currentShortRow?.plty ? currentShortRow?.plty + penalty : 0 + penalty;
        currentShortRow = {
          //id: currentShortRow.id,
          s: currentShortRow.s,
          e: row.date,
          i: currentShortRow.i,
          inc: row.inc,
          dec: row.dec,
          o: row.out,
          pcnt: row.percent,
          plty: sumPenalty  
        }
        if (array.length - 1 === index) {
          rows.push(currentShortRow);
        }
      }

      if (currentShortRow === null) currentShortRow = {
        s: row.date,
        e: row.date,
        ...row
      } as ShortTableRow;

      lastShortRow = currentShortRow;
      // после проверки текущий ряд сохраняем в переменную
      lastRow = row;
      //console.log('row: ', row);
    
    });

    //console.log('currentShortRow: ', currentShortRow);
    //console.log('lastShortRow: ', lastShortRow);
    console.log('rows: ', rows);
    let maxLenth = 0;
    let print = '';
    let sum = 0;
    rows.forEach(row => {
      const start = row.s.toLocaleDateString();
      const end = row.e.toLocaleDateString();
      
      const oneDay = 1000 * 60 * 60 * 24;
      // Вычисление разницы во времени между двумя датами
      const diffInTime = row.e.getTime() - row.s.getTime();
      // Вычисление количества дней между двумя датами
      const diffInDays = Math.round(diffInTime / oneDay);

      const daysInYear = getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

      const sumin = row.i;
      const inc = row.inc;
      const dec = row.dec;
      const sumout = row.o;
      const percent = Number(row.pcnt); // процент в год
      const percentPerDay = percent / daysInYear;
      console.log('percentPerDay: ', percentPerDay);
      const penalty = Number(row.plty)/100;

      //const str = `${startdate} - ${enddate} ${sumin} + ${inc} - ${dec} = ${sumout} (${percent}% * ${sumin} * ${diffInDays + 1} = ${penalty.toFixed(4)})\n`;
      const str2 = `${start} - ${end} ${sumin?.toString().padStart(9, ' ')} + ${inc?.toString().padStart(9, ' ')} - ${dec?.toString().padStart(9, ' ')} = ${sumout?.toString().padStart(9, ' ')} ${percentPerDay?.toFixed(4).toString().padStart(3, ' ')}% ${(diffInDays + 1).toString().padStart(3, ' ')} ${penalty.toFixed(2).toString().padStart(9, ' ')}\n`;
      print = print + str2;
      sum = sum + penalty;
      if (str2.toString().length > maxLenth) maxLenth = str2.toString().length;
    });
 
    /** принт тест */
    //console.log('maxLenth: ', maxLenth);
    let line = new Array(maxLenth + 1).join( '-' );
    line = line + '\n';
    
    print = '*** Расчёт процентов по ст.395 ГК РФ\n\n' + line + print;
    print = print + line;
    console.log (print);
    console.log('Сумма процентов: ', sum.toFixed(2));
    /** принт тест */

    setSum(sum);
    return rows;
  }

  function doMainTable(
    from: Date,
    to: Date,
    type?: number, // 0 - 395, 1 - договорная неустойка
    rate?: number, // ставка
    periodType?: number // 1 - день, 2 - год
  ) {
    console.log('type: ', type !==1 ? 'Расчёт процентов по ст.395 ГК РФ': 'Расчёт договорной неустойки');
    console.log('rate: ', rate );
    
    const newMainTable: MainTableRow[] = [];
    const n = getDays(from, to);
    const newArray = new Array(n).fill(null).map((_, i) => i + 1);

    const currentDate = new Date();
    const currentKey = keyratesTable.find(row => row.date === new Date().toLocaleDateString())?.key;
    const currentRate = type !==1 ? currentKey : rate;

    console.log('currentKey: ', currentKey);
    console.log('currentRate: ', currentRate);
    console.log('periodType: ', periodType);
    console.log('periodText: ', periodtypes.filter(obj => obj.value === periodType)[0].name);

    let debtsumin = 0;
    let increase = 0;
    let decrease = 0;
    let debtsumout = 0;
//    let percent = 0.00;
//    let penalty = 0;
    newArray.map((item, index) => {

      const indexDate = new Date(from.getFullYear(), from.getMonth(), from.getDate() + index);

      const daysInYear = getDayOfYear(new Date(indexDate.getFullYear(), 11, 31));
      //console.log('daysInYear: ', daysInYear);

      const inFuture = indexDate > currentDate;
      //inFuture && console.log('Будущее наступило...');
      const currentDayRate = currentRate !== undefined ? periodType === 1 ? currentRate : currentRate / daysInYear : undefined;
      console.log(`currentDayRate: ${currentDayRate?.toFixed(4)}%`);
      // вот здесь нужно подставлять процентную ставку из таблицы ключевых ставок или договорную неустойку

      const keyRate = inFuture ?  currentKey : keyratesTable.find(row => row.date === indexDate.toLocaleDateString())?.key;
      console.log('keyRate: ', keyRate);
      console.log('currentRate: ', currentRate);
      console.log('type: ', type);
      console.log('periodType: ', periodType);

      const percent = type !== 1 ? keyRate : periodType === 1 ? currentRate && (currentRate * daysInYear): currentRate;
      console.log('percent: ', percent);

      if (debtsumout !== debtsumin) {
        debtsumin = debtsumout;
      } else if (debtsumin === 0) {
        debtsumin = debt;
      }

      const foundDecrease = DebtDecrease.find((obj) => {
        const cDate = indexDate.toLocaleDateString();
        const oDate = obj.date.toLocaleDateString();
        return oDate === cDate;
      });

      if (foundDecrease) {
        decrease = foundDecrease.sum;
      }

      const foundIncrease = DebtIncrease.find((obj) => {
        const cDate = indexDate.toLocaleDateString();
        const oDate = obj.date.toLocaleDateString();
        return oDate === cDate;
      });

      if (foundIncrease) {
        increase = foundIncrease.sum;
      }

      debtsumout = debtsumin + increase - decrease;

      const newRow: MainTableRow = {
        id: item,
        date: indexDate,
        in: debtsumin,
        inc: increase,
        dec: decrease,
        out: debtsumout,
        percent: percent,
        penalty: percent ? (( percent / daysInYear ) * ( debtsumin + increase )) : 0
      }

      debtsumin = debtsumout;
      increase = 0;
      decrease = 0;

      /*
      const tempRow = {
        id: item,
        date: newRow.date.toLocaleDateString(),
        debtsumin: newRow.debtsumin,
        increase: newRow.increase,
        decrease: newRow.decrease,
        debtsumout: newRow.debtsumout,
        percent: newRow.percent,
        penalty: newRow.penalty
      }
      */

      //console.log('newRow: ', tempRow);

      newMainTable.push(newRow);
    });
    console.log('newMainTable: ', newMainTable);
    return newMainTable;
  }

  

  //console.log('getMaxDebtRowId: ', getMaxDebtRowId(DebtPayments));

  /*
    // сохранение изменений в таблице
    setDebtPayments(prevDebtPayments => [
      ...prevDebtPayments,
      { date: new Date(), sum: 0 },
    ]);

  */

  const dateDebtTemplate = (row: DebtRow) => {
    const value = row.date;
    return (
      <Calendar
        id={'debtdecrease_' + row.id}
        className='debt'
        value={new Date(value)}
        onChange={(e: any) => e.value}
        touchUI
        showIcon
        locale='ru'
      />
    );
  }

  const sumDebtDecreaseTemplate = (rowData: DebtRow) => {
    const value: number = rowData.sum;
    
    return (
      <div className="p-inputgroup flex-1">
        <InputNumber
          value={value}
          locale='ru'
          //ref={(input) => input && input.focus()}
          onValueChange={(e) => {
            let newDebtDecrease = [...DebtDecrease];
            newDebtDecrease[rowData.id - 1].sum = Number(e.value);
            setDebtDecrease(newDebtDecrease);
          }}
        />
        <Button icon="pi pi-times" className='debttrash' onClick={
            () => {
              locale('ru');
              setDebtDecrease(DebtDecrease.filter((p) => p.id !== rowData.id));
            }
          }
        />
      </div>
    );
  }

  const sumDebtIncreaseTemplate = (rowData: DebtRow) => {
    const value: number = rowData.sum;
    
    return (
      <div className="p-inputgroup flex-1">
        <InputNumber
          value={value}
          locale='ru'
          //ref={(input) => input && input.focus()}
          onValueChange={(e) => {
            let newDebtIncrease = [...DebtIncrease];
            newDebtIncrease[rowData.id - 1].sum = Number(e.value);
            setDebtIncrease(newDebtIncrease);
          }}
        />
        <Button icon="pi pi-times" className='debttrash' onClick={
            () => {
              locale('ru');
              setDebtIncrease(DebtIncrease.filter((p) => p.id !== rowData.id));
            }
          }
        />
      </div>
    );
  }

  /*
  const countBodyTemplate = (rowData: Row) => {
    const value: number = rowData.count;
    return (
      <InputNumber value={value}/>
    );
  };
  */

  const calcRowTemplate = (Row: ShortTableRow, index: number) => {
    return (
      <div className="col-12" key={index}>
        <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-2 gap-2', { 'border-top-1 surface-border': index !== 0 })}>
          <div className="flex flex-row flex-wrap gap-2">
            <div className="flex align-items-top justify-content-left w-10rem h-1rem font-bold text-900">
              <div className="inline-block h-rem text-left">{Row.s.toLocaleDateString()}</div>
              <div className="inline-block h-rem text-center mx-1">-</div>
              <div className="inline-block h-rem text-right">{Row.e.toLocaleDateString()}</div>
            </div>
            <div className="flex align-items-top justify-content-center w-12rem h-2rem">
              <div className="flex flex-column xl:flex-row justify-content-between xl:align-items-start flex-1 gap-2">
                <div className="card-container flex flex-row flex-wrap">
                  <div className="inline-block h-rem text-left">{Row.i?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">+</div>
                  <div className="inline-block h-rem">{Row.inc?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">-</div>
                  <div className="inline-block h-rem text-left">{Row.dec?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">=</div>
                  <div className="inline-block h-rem text-left">{Row.o?.toLocaleString()}</div>
                </div>
                <div className="card-container flex flex-row flex-wrap">
                  <div className='inline-block h-rem text-left'>{Math.round((Row.e.getTime() - Row.s.getTime()) / (1000 * 60 * 60 * 24))+1}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">*</div>
                  <div className="inline-block">{Row.pcnt?.toString()}% / {getDayOfYear(new Date(Row.e.getFullYear(), 11, 31))}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">*</div>
                  <div className="inline-block">{Row.inc === 0 ? Row.i?.toLocaleString() : Row.o?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">=</div>
                </div>
              </div>
            </div>
            <div className="flex align-items-top justify-content-center w-4rem h-2rem">
              <div className="flex flex-column xl:flex-row justify-content-between xl:align-items-start flex-1 gap-2">
                <div className="card-container">
                  <div className="inline-block w-rem h-rem text-left"></div>
                </div>
                <div className="card-container">
                  <div className="inline-block font-bold app theme-accent-text-color">{Row.plty && parseFloat(Row.plty.toFixed(2)).toLocaleString()}</div>
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    );
  };

  const calcResultTemplate = (Rows: ShortTableRow[]) => {
      if (!Rows || Rows.length === 0) return null;

      let list = Rows.map((Row, index) => {
          return calcRowTemplate(Row, index);
      });
      
      return <div className="grid grid-nogutter">{list}</div>;
    };

  const calcHeaderTemplate = () => {
    return (
      <div className="col-12">
        <div className="flex flex-column xxl:flex-row xxl:align-items-start gap-2">
          <div className="flex flex-row flex-wrap gap-2">
            <div className="flex align-items-top justify-content-left w-10rem font-bold text-700">
              <div className="inline-block h-rem text-left">Период</div>
            </div>
            <div className="flex align-items-top justify-content-center w-12rem h-2rem font-normal text-500 gap-2">
              <div className="flex flex-column xxl:flex-row justify-content-between xxl:align-items-start flex-1 gap-2">
                <div className="card-container">
                  <div className="inline-block h-rem text-center gap-2">Задолженность</div>
                </div>
                <div className="card-container">
                  <div className="inline-block h-rem text-center">{type!==1 ? 'Расчёт процентов' : 'Расчёт неустойки'}</div>
                </div>
              </div>
            </div>
            <div className="flex align-items-top justify-content-center w-4rem h-2rem">
              <div className="flex flex-column xl:flex-row justify-content-between xl:align-items-start flex-1 gap-2">
                <div className="card-container">
                  <div className="inline-block w-rem h-rem text-left"></div>
                </div>
                <div className="card-container">
                  <div className="inline-block font-bold app theme-accent-text-color">Сумма</div>
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    );
  }

  const calcFooterTemplate = () => {
    return (
      <div className="col-12">
        <div className="flex flex-column xxl:flex-row xxl:align-items-start gap-2">
          <div className="flex flex-row flex-wrap gap-2">
            <div className="flex align-items-top justify-content-left font-bold text-700">
              <div className="inline-block h-rem text-left app theme-accent-text-color">Сумма процентов: {sum && parseFloat(sum.toFixed(2)).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='calc'>
      <PrimeReactProvider>
      <Panel
        header={title || 'Заголовок'}
        footer={'Подвал'}
        className='m-1 shadow-5'
      >
        {/* --раздел-- */}
        <AppSection 
          subheader={'Сумма задолженности'}
          body={
            <div className="p-inputgroup flex-1">
              <InputNumber 
                id="sum"
                placeholder="Сумма задолженности"
                value={debt}
                onValueChange={(e) => setDebt(Number(e.value))}
                locale='ru'
              />
              <SelectButton 
                id="currency"
                value={currency} 
                onChange={(e) => setCurrency(e.value)} 
                optionLabel="name" 
                options={currencies}
              />
            </div>
          }
          subheaderNoWrap
        />
        {/* --раздел-- ставка неустойки */}
        { type !== 0 && <AppSection 
          subheader={'Ставка'}
          body={
            <div className="p-inputgroup flex-1">
              <InputNumber 
                id="rate"
                placeholder="Ставка"
                value={rate}
                mode='decimal'
                maxFractionDigits={2}
                step={0.01}
                suffix='%'
                onValueChange={(e) => setRate(Number(e.value))}
                locale='ru'
              />
              <SelectButton 
                id="periodtype"
                value={periodtype} 
                onChange={(e) => setPeriodType(e.value)} 
                optionLabel="name" 
                options={periodtypes}
              />
            </div>
          }
          subheaderNoWrap
        />
        }
        {/* --раздел-- */}
        <AppSection
          subheader={'Период расчета'}
          body={
            <div className="p-inputgroup flex-1">
              <Calendar
                id='datefrom'
                value={datefrom}
                onChange={(e: any) => {
                  setDateFrom(e.value);
                  if (dateto) {
                    setNumberOfDays(getDays(e.value, dateto));
                  }
                }}
                placeholder='От'
                touchUI
                showIcon
                locale='ru'
              />
              <div className='m-1'/>
              <Calendar
                id='dateto'
                value={dateto}
                onChange={(e: any) => {
                  setDateTo(e.value);
                  if (datefrom) {
                    setNumberOfDays(getDays(datefrom, e.value));
                  }

                }}
                placeholder='До'
                touchUI
                showIcon
                locale='ru'
              />
              <div className='m-1'/>
              
                <InputNumber 
                  className='numberOfDays'
                  value={numberOfDays}
                  disabled
                  locale='ru'
                />
              
              
            </div>
            
          }
          subheaderNoWrap
        />
        {/* --раздел-- */}
        <AppSection 
          subheader={'Оплата долга'}
          body={
            <div>
              <DataTable value={DebtDecrease} size='small'>
                <Column field='id' className='debtid' header='#'/>
                <Column field='date' className='debtdate' header='Дата' body= { dateDebtTemplate }/>
                <Column field='sum' className='debtsum' header='Сумма' body={ sumDebtDecreaseTemplate } />
              </DataTable>
              <div style={{width: '100%'}} className='flex justify-content-start'>
                <Button icon="pi pi-plus" className='debtplus mt-2' onClick={
                  () => {
                    locale('ru');
                    setDebtDecrease([...DebtDecrease, { id: getMaxDebtRowId(DebtDecrease) + 1, date: new Date(), sum: 0}]);
                  }
                }/>
              </div>
            </div>
          }
        />
        {/* --раздел-- */}
          <AppSection 
          subheader={'Увеличение долга'}
          body={
            <div>
              <DataTable value={DebtIncrease} size='small'>
                <Column field='id' className='debtid' header='#'/>
                <Column field='date' className='debtdate' header='Дата' body= { dateDebtTemplate }/>
                <Column field='sum' className='debtsum' header='Сумма' body={ sumDebtIncreaseTemplate } />
              </DataTable>
              <div style={{width: '100%'}} className='flex justify-content-start'>
                <Button icon="pi pi-plus" className='debtplus mt-2' onClick={
                  () => {
                    locale('ru');
                    setDebtIncrease([...DebtIncrease, { id: getMaxDebtRowId(DebtIncrease) + 1, date: new Date(), sum: 0}]);
                  }
                }/>
              </div>
            </div>
          }
          borderBottom
        />
        {/* --раздел-- */}
        {/*<AppSection 
          subheader={'Таблица'}
          body={
            <DataTable value={products} size='small'>
              <Column field='id' header='#' />
              <Column field='name' header='Наименование' />
              <Column field='count' header='Количество' body={ countBodyTemplate } />
            </DataTable>
          }
          subheaderNoWrap
          borderBottom
        />*/}
        
        {/* --раздел-- */}
        { Rows && <AppSection
          header={'Расчёт'}
          subheader={type !== 1 ? 'Расчёт процентов за пользование чужими денежными средствами, в соответствии со статьей 395 ГК РФ' : 'Расчёт неустойки производится в соответствии с условиями договора'}
          body={
            <div className="card mt-2">
              {
              Rows && 
              <>
                <DataView
                  id="dataview"
                  value={Rows}
                  header={calcHeaderTemplate()}
                  listTemplate={calcResultTemplate}
                  footer={calcFooterTemplate()}
                />
              </>
                  
      
              }
              
            </div>
          }
          borderBottom
        />}
        {/* --раздел-- */}
        <AppSection
          header={'Заголовок 1'}
          subheader={'Подзаголовок 1'}
          body={'Текст 1'}
          subheaderNoWrap
          borderBottom
        />
        {/* --раздел-- */}
        <AppSection
          header={'Заголовок 2'}
          subheader={'Подзаголовок 2'}
          body={'Текст 2'}
          subheaderNoWrap
        />
      </Panel>
      { false &&
        <div id='dummy'>
          <input id='ddolg'/>
          <input id='ffirstdate'/>
          <input id='seconddate'/>
          <select id='rregion'/>
          <input id='effdni'/>
        </div>
      }
      
      </PrimeReactProvider>
    </div>
       
  )
}


/*

id    startdate   enddate     debtsumin   increase  decrease  debtsumout  percent  penalty
1     01.02.2025  04.02.2025  100000      0         0         100000      21       230.1370
-------------------------------------------------------------------------------------------
-     01.02.2025  01.02.2025  100000      0         0         100000      21       57.5342
-     02.02.2025  02.02.2025  100000      0         0         100000      21       57.5342
-     03.02.2025  03.02.2025  100000      0         0         100000      21       57.5342
-     04.02.2025  04.02.2025  100000      0         0         100000      21       57.5342
-------------------------------------------------------------------------------------------
2     05.02.2025  05.02.2025  100000      0         10000     90000       21       57.5342
-------------------------------------------------------------------------------------------
-     05.02.2025  05.02.2025  100000      0         10000     90000       21       57.5342
-------------------------------------------------------------------------------------------
3     06.02.2025  09.02.2025  90000       0         0         90000       21       207.1233
-------------------------------------------------------------------------------------------
-     06.02.2025  06.02.2025  90000       0         0         90000       21       51.7808
-     07.02.2025  07.02.2025  90000       0         0         90000       21       51.7808
-     08.02.2025  08.02.2025  90000       0         0         90000       21       51.7808
-     09.02.2025  09.02.2025  90000       0         0         90000       21       51.7808
-------------------------------------------------------------------------------------------
4     10.02.2025  10.02.2025  90000       0         10000     80000       21       51.7808
-------------------------------------------------------------------------------------------
-     10.02.2025  10.02.2025  90000       0         10000     80000       21       51.7808
-------------------------------------------------------------------------------------------
5     11.02.2025  16.02.2025  80000       0         0         80000       21       276.1644
-------------------------------------------------------------------------------------------
-     11.02.2025  11.02.2025  80000       0         0         80000       21       46.0274
-     12.02.2025  12.02.2025  80000       0         0         80000       21       46.0274
-     13.02.2025  13.02.2025  80000       0         0         80000       21       46.0274
-     14.02.2025  14.02.2025  80000       0         0         80000       21       46.0274
-     15.02.2025  15.02.2025  80000       0         0         80000       21       46.0274
-     16.02.2025  16.02.2025  80000       0         0         80000       21       46.0274
-------------------------------------------------------------------------------------------
6     17.02.2025  17.02.2025  80000       0         10000     70000       21       46.0274
-------------------------------------------------------------------------------------------
-     17.02.2025  17.02.2025  80000       0         10000     70000       21       46.0274
-------------------------------------------------------------------------------------------
7     18.02.2025  23.02.2025  70000       0         0         70000       21       241.6438
-------------------------------------------------------------------------------------------
-     18.02.2025  18.02.2025  70000       0         0         70000       21       40.2739
-     19.02.2025  19.02.2025  70000       0         0         70000       21       40.2739
-     20.02.2025  20.02.2025  70000       0         0         70000       21       40.2739
-     21.02.2025  21.02.2025  70000       0         0         70000       21       40.2739
-     22.02.2025  22.02.2025  70000       0         0         70000       21       40.2739
-     23.02.2025  23.02.2025  70000       0         0         70000       21       40.2739
-------------------------------------------------------------------------------------------
8     24.02.2025  24.02.2025  70000       0         10000     60000       21       40.2739
-------------------------------------------------------------------------------------------
-     24.02.2025  24.02.2025  70000       0         10000     60000       21       40.2739
-------------------------------------------------------------------------------------------
9     25.02.2025  24.03.2025  60000       0         0         60000       21      276.1644
-------------------------------------------------------------------------------------------
-     25.02.2025  25.02.2025  60000       0         0         60000       21      34.5205 
-     26.02.2025  26.02.2025  60000       0         0         60000       21      34.5205
-     27.02.2025  27.02.2025  60000       0         0         60000       21      34.5205
-     28.02.2025  28.02.2025  60000       0         0         60000       21      34.5205
-     01.03.2025  01.03.2025  60000       0         0         60000       21      34.5205
-     02.03.2025  02.03.2025  60000       0         0         60000       21      34.5205
-     03.03.2025  03.03.2025  60000       0         0         60000       21      34.5205
-     04.03.2025  04.03.2025  60000       0         0         60000       21      34.5205
-------------------------------------------------------------------------------------------
10    05.03.2025  05.03.2025  60000       40000     0         100000      21      34.5205 
-------------------------------------------------------------------------------------------
-     05.03.2025  05.03.2025  60000       40000     0         100000      21      34.5205
-------------------------------------------------------------------------------------------
*/

/*
[
    {
        "id": 1,
        "startdate": "2025-02-09T21:00:00.000Z",
        "enddate": "2025-02-09T21:00:00.000Z",
        "debtsumin": 100000,
        "increase": 0,
        "decrease": 0,
        "debtsumout": 100000,
        "percent": 21,
        "penalty": 5753.424657534247
    },
    {
        "id": 2,
        "startdate": "2025-02-10T21:00:00.000Z",
        "enddate": "2025-02-10T21:00:00.000Z",
        "debtsumin": 99000,
        "increase": 0,
        "decrease": 1000,
        "debtsumout": 99000,
        "percent": 21,
        "penalty": 5753.424657534247
    },
    {
        "id": 3,
        "startdate": "2025-02-11T21:00:00.000Z",
        "enddate": "2025-02-11T21:00:00.000Z",
        "debtsumin": 102000,
        "increase": 3000,
        "decrease": 0,
        "debtsumout": 102000,
        "percent": 21,
        "penalty": 5695.890410958904
    },
    {
        "id": 4,
        "startdate": "2025-02-12T21:00:00.000Z",
        "enddate": "2025-03-09T21:00:00.000Z",
        "debtsumin": 102000,
        "increase": 0,
        "decrease": 0,
        "debtsumout": 102000,
        "percent": 21,
        "penalty": 152580.82191780812
    },
    {
        "id": 30,
        "startdate": "2025-03-10T21:00:00.000Z",
        "enddate": "2025-03-10T21:00:00.000Z",
        "debtsumin": 100000,
        "increase": 0,
        "decrease": 2000,
        "debtsumout": 100000,
        "percent": 21,
        "penalty": 5868.493150684932
    },
    {
        "id": 31,
        "startdate": "2025-03-11T21:00:00.000Z",
        "enddate": "2025-03-11T21:00:00.000Z",
        "debtsumin": 102000,
        "increase": 2000,
        "decrease": 0,
        "debtsumout": 102000,
        "percent": 21,
        "penalty": 5753.424657534247
    },
    {
        "id": 32,
        "startdate": "2025-03-12T21:00:00.000Z",
        "enddate": "2025-04-09T21:00:00.000Z",
        "debtsumin": 102000,
        "increase": 0,
        "decrease": 0,
        "debtsumout": 102000,
        "percent": 21,
        "penalty": 170186.3013698629
    },
    {
        "id": 61,
        "startdate": "2025-04-10T21:00:00.000Z",
        "enddate": "2025-04-10T21:00:00.000Z",
        "debtsumin": 99000,
        "increase": 0,
        "decrease": 3000,
        "debtsumout": 99000,
        "percent": 21,
        "penalty": 5868.493150684932
    },
    {
        "id": 62,
        "startdate": "2025-04-11T21:00:00.000Z",
        "enddate": "2025-04-11T21:00:00.000Z",
        "debtsumin": 100000,
        "increase": 1000,
        "decrease": 0,
        "debtsumout": 100000,
        "percent": 21,
        "penalty": 5695.890410958904
    },
    {
        "id": 63,
        "startdate": "2025-04-12T21:00:00.000Z",
        "enddate": "2025-04-29T21:00:00.000Z",
        "debtsumin": 100000,
        "increase": 0,
        "decrease": 0,
        "debtsumout": 100000,
        "percent": 21,
        "penalty": 103561.6438356164
    }
]
*/


  /*
  function getKeyRate() {
    const xmlhttp = new XMLHttpRequest();
          xmlhttp.open('POST', 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx');
          xmlhttp.setRequestHeader('Content-Type', 'application/soap+xml; charset=utf-8');
          //xmlhttp.setRequestHeader('Host', 'url');
          xmlhttp.setRequestHeader('Access-Control-Request-Origin', 'http://localhost:5173');
          xmlhttp.setRequestHeader('Access-Control-Request-Origin', '*');
          xmlhttp.setRequestHeader('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
          xmlhttp.setRequestHeader('SOAPAction', 'http://web.cbr.ru/KeyRateXML');

    const fromDate = '01.01.2025';
    const toDate = '31.01.2025';

    // build SOAP request
    const sr =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' + 
        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
        'xmlns:soap12="http://www.w3.org/2003/05/soap-envelope>' +
        '<soap12:Body>' +
          '<KeyRateXML xmlns="http://web.cbr.ru/">' +
            '<fromDate>' + fromDate + '</fromDate>' +
            '<ToDate>' + toDate + '</ToDate>' +
          '</KeyRateXML>' +
        '</soap12:Body' +
      '</soap12:Envelope>';

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            console.log(xmlhttp.responseText);
            // alert('done. use firebug/console to see network response');
          }
        }
      }
      // Send the POST request
      xmlhttp.setRequestHeader('Content-Type', 'text/xml');
      xmlhttp.send(sr);
      // send request
      // ...
  }
*/
  //getKeyRate();
