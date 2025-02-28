import * as keyrates from '../../components/Calc/keyrates.json';
console.log(keyrates);

import  { parse } from 'date-fns'; // https://date-fns.org/

export function dateFromString(dateString: string) {
  return parse(dateString, 'dd.MM.yyyy', new Date());
}

export function getDayOfYear(date = new Date()) {
  const timestamp1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const timestamp2 = Date.UTC(date.getFullYear(), 0, 0);
  const differenceInMilliseconds = timestamp1 - timestamp2;
  const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;
  return differenceInDays;
}

export function getDays(from: Date, to: Date) {
  const diffTime = Math.abs(to.getTime() - from.getTime()) + 1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}


interface KeyRatesTableRow {
  date: string;
  key: number;
}

export function doKeyRatesTable() {
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