
import * as RU from '../../locale/ru.json';

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
  title?: string;
}

interface MainTableRow {
  id: number;
  date: Date;
  debtsumin?: number;
  increase?: number;
  decrease?: number;
  debtsumout?: number; 
  percent?: number;
  penalty?: number;
}

interface ShortTableRow {
  id: number;
  startdate: Date;
  enddate: Date;
  debtsumin?: number;
  increase?: number;
  decrease?: number;
  debtsumout?: number; 
  percent?: number;
  penalty?: number;
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


const keyratesTable = doKeyRatesTable(); // ключевые ставки по дням

export const Calc: FC<CalcProps> = ({title}) => {
  //const [mainTable, setMainTable] = useState<MainTableRow[]>([]); // ежедневные записи
  //const [shortTable, setShortTable] = useState<ShortTableRow[]>([]); // краткая таблица
  //const [keyratesTable, setKeyRatesTable] = useState<KeyRatesTableRow[]>(doKeyRatesTable()); // ключевые ставки по дням
  const [debt, setDebt] = useState<number>(0);
  const [currency, setCurrency] = useState(1);
  const [datefrom, setDateFrom] = useState(null);
  const [dateto, setDateTo] = useState(null);
  const [numberOfDays, setNumberOfDays] = useState(0);

  //useEffect(() => console.log(keyratesTable),[]);

  // Платежи в погашение долга
  const [DebtDecrease, setDebtDecrease] = useState<DebtRow[]>(debtdecrease);

  // Увеличение долга
  const [DebtIncrease, setDebtIncrease] = useState<DebtRow[]>(debtincrease);

  // usestate
  const [Rows, setRows] = useState<ShortTableRow[]>(); // текущая группа
  
  const [sum, setSum] = useState(0);

  useEffect(() => {
    if (datefrom && dateto) {
      const newMainTable = doMainTable(datefrom, dateto);
      //setMainTable(newMainTable);
      const newShortTable = doShortTable(newMainTable);
      console.log(newShortTable);
      setRows(newShortTable);
    }
  }, [debt, datefrom, dateto]);
  

  /*
  const products = [
    {id: 1, name: 'Product 1', count: 1},
    {id: 2, name: 'Product 2', count: 2},
    {id: 3, name: 'Product 3', count: 3},
  ];
  */

/*
  interface Row {
    id: number;
    name: string;
    count: number;
  }
*/


  interface DebtRow {
    id: number;
    date: Date;
    sum: number;
  }

  const currencies = [
    { name: '₽', value: 1 },
    { name: '$', value: 2 },
    { name: '€', value: 3 }
  ];


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
            lastRow?.debtsumin !== row.debtsumin || 
            lastRow?.debtsumout !== row.debtsumout || 
            lastRow?.percent !== row.percent;

      if (setNewShortRow) {
        //console.log('%cключевые параметры изменились','color: pink');
        currentShortRow = {
          id: row.id,
          startdate: row.date,
          enddate: row.date,
          debtsumin: row.debtsumin,
          increase: row.increase,
          decrease: row.decrease,
          debtsumout: row.debtsumout,
          percent: row.percent,
          penalty: row.penalty  
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
        const sumPenalty = currentShortRow?.penalty ? currentShortRow?.penalty + penalty : 0 + penalty;
        currentShortRow = {
          id: currentShortRow.id,
          startdate: currentShortRow.startdate,
          enddate: row.date,
          debtsumin: currentShortRow.debtsumin,
          increase: row.increase,
          decrease: row.decrease,
          debtsumout: row.debtsumout,
          percent: row.percent,
          penalty: sumPenalty  
        }
        if (array.length - 1 === index) {
          rows.push(currentShortRow);
        }
      }

      if (currentShortRow === null) currentShortRow = {
        startdate: row.date,
        enddate: row.date,
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
      const startdate = row.startdate.toLocaleDateString();
      const enddate = row.enddate.toLocaleDateString();
      
      const oneDay = 1000 * 60 * 60 * 24;
      // Вычисление разницы во времени между двумя датами
      const diffInTime = row.enddate.getTime() - row.startdate.getTime();
      // Вычисление количества дней между двумя датами
      const diffInDays = Math.round(diffInTime / oneDay);
     
      const sumin = row.debtsumin;
      const inc = row.increase;
      const dec = row.decrease;
      const sumout = row.debtsumout;
      const percent = Number(row.percent)/100;
      const penalty = Number(row.penalty)/100;

      //const str = `${startdate} - ${enddate} ${sumin} + ${inc} - ${dec} = ${sumout} (${percent}% * ${sumin} * ${diffInDays + 1} = ${penalty.toFixed(4)})\n`;
      const str2 = `${startdate} - ${enddate} ${sumin?.toString().padStart(9, ' ')} + ${inc?.toString().padStart(9, ' ')} - ${dec?.toString().padStart(9, ' ')} = ${sumout?.toString().padStart(9, ' ')} ${percent?.toString().padStart(3, ' ')}% ${(diffInDays + 1).toString().padStart(3, ' ')} ${penalty.toFixed(2).toString().padStart(9, ' ')}\n`;
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

  function doMainTable(from: Date, to: Date) {
    const newMainTable: MainTableRow[] = [];
    const n = getDays(from, to);
    const newArray = new Array(n).fill(null).map((_, i) => i + 1);

    const currentDate = new Date();
    const currentKey = keyratesTable.find(row => row.date === new Date().toLocaleDateString())?.key;
    console.log('currentKey: ', currentKey);

    let debtsumin = 0;
    let increase = 0;
    let decrease = 0;
    let debtsumout = 0;
    let percent = 0.00;
    let penalty = 0;
    newArray.map((item, index) => {

      const indexDate = new Date(from.getFullYear(), from.getMonth(), from.getDate() + index);

      const daysInYear = getDayOfYear(new Date(indexDate.getFullYear(), 11, 31));
      //console.log('daysInYear: ', daysInYear);

      const inFuture = indexDate > currentDate;
      //inFuture && console.log('Будущее наступило...');
      const key = !inFuture ? keyratesTable.find(row => row.date === indexDate.toLocaleDateString())?.key : currentKey;
      //console.log('key: ', key);
      // вот здесь должна быть сборка всех операций для ежедневных записей
      /*
        interface MainTableRow {
          id: number;
          date: Date;
          debtsumin?: number;
          increase?: number;
          decrease?: number;
          debtsumout?: number; 
          percent?: number;
          penalty?: number;
        }
      */
      //if (debt > 0) {
      //  debtsumin = debtsumout = debt;
      //}

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
        debtsumin: debtsumin,
        increase: increase,
        decrease: decrease,
        debtsumout: debtsumout,
        percent: key,
        penalty: key ? (( key / daysInYear ) * (debtsumin+increase)) : 0
      }

      debtsumin = debtsumout;
      increase = 0;
      decrease = 0;

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

      //console.log('newRow: ', tempRow);

      newMainTable.push(newRow);
    })
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
      <div className="col-12" key={Row.id}>
        <div className={classNames('flex flex-column xl:flex-row xl:align-items-start p-2 gap-2', { 'border-top-1 surface-border': index !== 0 })}>
          <div className="flex flex-row flex-wrap gap-2">
            <div className="flex align-items-top justify-content-left w-10rem h-1rem font-bold text-900">
              <div className="inline-block h-rem text-left">{Row.startdate.toLocaleDateString()}</div>
              <div className="inline-block h-rem text-center mx-1">-</div>
              <div className="inline-block h-rem text-right">{Row.enddate.toLocaleDateString()}</div>
            </div>
            <div className="flex align-items-top justify-content-center w-12rem h-2rem">
              <div className="flex flex-column xl:flex-row justify-content-between xl:align-items-start flex-1 gap-2">
                <div className="card-container flex flex-row flex-wrap">
                  <div className="inline-block h-rem text-left">{Row.debtsumin?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">+</div>
                  <div className="inline-block h-rem">{Row.increase?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">-</div>
                  <div className="inline-block h-rem text-left">{Row.decrease?.toLocaleString()}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">=</div>
                  <div className="inline-block h-rem text-left">{Row.debtsumout?.toLocaleString()}</div>
                </div>
                <div className="card-container flex flex-row flex-wrap">
                  <div className='inline-block h-rem text-left'>{Math.round((Row.enddate.getTime() - Row.startdate.getTime()) / (1000 * 60 * 60 * 24))+1}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">*</div>
                  <div className="inline-block">{Row.percent?.toString()}% / {getDayOfYear(new Date(Row.enddate.getFullYear(), 11, 31))}</div>
                  <div className="inline-block w-rem h-rem text-left mx-1">*</div>
                  <div className="inline-block">{Row.increase === 0 ? Row.debtsumin?.toLocaleString() : Row.debtsumout?.toLocaleString()}</div>
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
                  <div className="inline-block font-bold text-900">{Row.penalty && parseFloat(Row.penalty.toFixed(2)).toLocaleString()}</div>
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
                  <div className="inline-block h-rem text-center">Расчёт процентов</div>
                </div>
              </div>
            </div>
            <div className="flex align-items-top justify-content-center w-4rem h-2rem">
              <div className="flex flex-column xl:flex-row justify-content-between xl:align-items-start flex-1 gap-2">
                <div className="card-container">
                  <div className="inline-block w-rem h-rem text-left"></div>
                </div>
                <div className="card-container">
                  <div className="inline-block font-bold text-900">Сумма</div>
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
              <div className="inline-block h-rem text-left">Сумма процентов: {sum && parseFloat(sum.toFixed(2)).toLocaleString()}</div>
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
        {/* --раздел-- */}
        <AppSection
          header={'Расчёт'}
          subheader={'Расчёт процентов за пользование чужими денежными средствами, в соответствии со статьей 395 ГК РФ'}
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