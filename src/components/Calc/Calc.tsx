
import * as RU from '../../locale/ru.json';

import * as keyrates from '../../components/Calc/keyrates.json';
console.log(keyrates);

import  { parse } from 'date-fns'; // https://date-fns.org/

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
import { id } from 'date-fns/locale';
import { get } from 'http';

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

function dateFromString(dateString: string) {
  return parse(dateString, 'dd.MM.yyyy', new Date());
}

function getDayOfYear(date = new Date()) {
  const timestamp1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const timestamp2 = Date.UTC(date.getFullYear(), 0, 0);
  const differenceInMilliseconds = timestamp1 - timestamp2;
  const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;
  return differenceInDays;
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


interface KeyRatesTableRow {
  date: string;
  key: number;
}

function getDays(from: Date, to: Date) {
  const diffTime = Math.abs(to.getTime() - from.getTime()) + 1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function doKeyRatesTable() {
  const fromDate = new Date(2016, 7, 1);
  const toDate = new Date();
  const days = getDays(fromDate, toDate);

  const newArray = new Array(days).fill(null).map((_, i) => i + 1); // массив с элементами по количеству дней

  const keyArray: KeyRatesTableRow[] = []; // массив с ключевыми ставками

  let lastKey = keyrates.data[0].key; // предыдущая ключевая ставка

  newArray.map((_, index) => {
    const currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + index);
    const findedKey = keyrates.data.find(row => row.date === currentDate.toLocaleDateString())?.key;
    const currentKey = findedKey ? findedKey : lastKey;
    const key = currentKey !== lastKey ? currentKey : lastKey; 

    lastKey = currentKey;
    
    const row: KeyRatesTableRow = index === 0 ? { 
      date: keyrates.data[0].date, key: keyrates.data[0].key
    } : {
      date: currentDate.toLocaleDateString(), key: key
    };

    keyArray.push(row);
  });
  return keyArray;//setKeyRatesTable(keyArray);
}

const keyratesTable = doKeyRatesTable(); // ключевые ставки по дням
console.log(keyratesTable);


export const Calc: FC<CalcProps> = ({title}) => {
  const [mainTable, setMainTable] = useState<MainTableRow[]>([]); // ежедневные записи
  const [shortTable, setShortTable] = useState<ShortTableRow[]>([]); // краткая таблица
  //const [keyratesTable, setKeyRatesTable] = useState<KeyRatesTableRow[]>(doKeyRatesTable()); // ключевые ставки по дням
  const [debt, setDebt] = useState<number>(0);
  const [currency, setCurrency] = useState(1);
  const [datefrom, setDateFrom] = useState(null);
  const [dateto, setDateTo] = useState(null);
  const [numberOfDays, setNumberOfDays] = useState(0);

  //useEffect(() => console.log(keyratesTable),[]);



  useEffect(() => {
    if (datefrom && dateto) {
      const newMainTable = doMainTable(datefrom, dateto);
      setMainTable(newMainTable);
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

  // Платежи в погашение долга
  const [DebtDecrease, setDebtDecrease] = useState<DebtRow[]>(debtdecrease);

  // Увеличение долга
  const [DebtIncrease, setDebtIncrease] = useState<DebtRow[]>(debtincrease);

  function doShortTable(mainTable: MainTableRow[]) {
    let currentGroup: ShortTableRow[] = []; // текущая группа
    let lastRow: MainTableRow; // предыдущая строка главной тааблицы


    mainTable.map((row, index, array) => {
      lastRow && console.log(lastRow);
      console.log(row);
      // здесь сравниваем row и lastRow


      // после проверки текущий ряд сохраняем в переменную
      lastRow = row;
    });
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
      console.log('daysInYear: ', daysInYear);

      const inFuture = indexDate > currentDate;
      inFuture && console.log('Будущее наступило...');
      const key = !inFuture ? keyratesTable.find(row => row.date === indexDate.toLocaleDateString())?.key : currentKey;
      console.log('key: ', key);
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
        penalty: key ? (( key / daysInYear ) * debtsumin) : 0
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

      console.log('newRow: ', tempRow);

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