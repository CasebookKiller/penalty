import { ReactNode } from 'react';

import * as nonWorkingDays from './nonWorkingDays.json';

console.log('Загружен модуль с функциями...')
import { Template } from '@pdfme/common';
import * as keyrates from './keyrates.json';
//console.log(keyrates);

//import { init, themeParams, miniApp } from '@telegram-apps/sdk-react';

//init(); console.log('init');
//themeParams.mountSync(); console.log('themeParams');
//miniApp.mountSync(); console.log('miniApp');

import { parse } from 'date-fns'; // https://date-fns.org/
import { SetStateAction } from 'react';
//import { date } from '@pdfme/schemas';

import * as jsoncrush from 'jsoncrush';

export const colors = {
  text: import.meta.env.VITE_TXT_COLOR,
  text_red: import.meta.env.VITE_TXT_COLOR_RED || '',
  accent: import.meta.env.VITE_ACCENT_TEXT_COLOR || '',
  background: import.meta.env.VITE_BACKGROUND_COLOR || '',
  hint: import.meta.env.VITE_HINT_COLOR || '',
  
}

export const currencies = [
  { name: '₽', value: 1, text: 'Российский рубль', eng: 'RUB', rus: 'руб.' },
  { name: '$', value: 2, text: 'Доллар США', eng: 'USD', rus: 'долл.' },
  { name: '€', value: 3, text: 'Евро', eng: 'EUR', rus: 'евро' },
];

// Интерфейс параметров для функции обратного вызова для обработки blob PDF
export interface IParamsDoWithPDF {
  sendAdmin?: boolean;            // Признак отправки админу
  cb?: (result: any) => void;     // Обработка результата обратного вызова
  caption?: string;               // Заголовок
  type?: number;                  // Тип расчета
}

// Интерфейс функции обратного вызова для обработки blob PDF
export interface IDoWithPDF {
  (
    blob: Blob,                       // Blob PDF
    InitialData: any,                 // Данные инициализации приложения
    params?: IParamsDoWithPDF         // Параметры
  ) : void 
}

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

/*
export function getCurrRates(cb: (result: any) => void) {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const rateRequestUrl = `https://www.cbr-xml-daily.ru/archive/${year}/${month}/${'21'}/daily_json.js`;

    
  fetch(rateRequestUrl)
    .then(response => {
      console.log('request request: ', response)
      return(response.json());
    })
    .then((data) => {
      console.log('data: ',data);
      cb(data);
    });
  

  //getCurrencies().then((result) => {
  //  cb(result);
  //});
}
*/

export async function getCurrencies(lastdate?: string) {
  const d = lastdate ? lastdate.split('.') : new Date().toLocaleDateString().split('.');
  const day = d[0], month = d[1], year = d[2];
  const rateRequestUrl = `https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`;
  //const rateRequestUrl = 'https://www.cbr-xml-daily.ru/daily_json.js';
  // https://www.cbr-xml-daily.ru/archive/2025/04/08/daily_json.js
  
  const response = await fetch(rateRequestUrl);
  const data = await response.json();
  const result = await data;
  console.log(result);

  const AUD = Number(result.Valute.AUD.Value.toFixed(4));
  const AZN = Number(result.Valute.AZN.Value.toFixed(4));
  const GBP = Number(result.Valute.GBP.Value.toFixed(4));
  const AMD = Number(result.Valute.AMD.Value.toFixed(4));
  const BYN = Number(result.Valute.BYN.Value.toFixed(4));
  const BGN = Number(result.Valute.BGN.Value.toFixed(4));
  const BRL = Number(result.Valute.BRL.Value.toFixed(4));
  const HUF = Number(result.Valute.HUF.Value.toFixed(4));
  const VND = Number(result.Valute.VND.Value.toFixed(4));
  const HKD = Number(result.Valute.HKD.Value.toFixed(4));
  const GEL = Number(result.Valute.GEL.Value.toFixed(4));
  const DKK = Number(result.Valute.DKK.Value.toFixed(4));
  const AED = Number(result.Valute.AED.Value.toFixed(4));
  const USD = Number(result.Valute.USD.Value.toFixed(4));
  const EUR = Number(result.Valute.EUR.Value.toFixed(4));
  const EGP = Number(result.Valute.EGP.Value.toFixed(4));
  const INR = Number(result.Valute.INR.Value.toFixed(4));
  const IDR = Number(result.Valute.IDR.Value.toFixed(4));
  const KZT = Number(result.Valute.KZT.Value.toFixed(4));
  const CAD = Number(result.Valute.CAD.Value.toFixed(4));
  const QAR = Number(result.Valute.QAR.Value.toFixed(4));
  const KGS = Number(result.Valute.KGS.Value.toFixed(4));
  const CNY = Number(result.Valute.CNY.Value.toFixed(4));
  const MDL = Number(result.Valute.MDL.Value.toFixed(4));
  const NZD = Number(result.Valute.NZD.Value.toFixed(4));
  const NOK = Number(result.Valute.NOK.Value.toFixed(4));
  const PLN = Number(result.Valute.PLN.Value.toFixed(4));
  const RON = Number(result.Valute.RON.Value.toFixed(4));
  const XDR = Number(result.Valute.XDR.Value.toFixed(4));
  const SGD = Number(result.Valute.SGD.Value.toFixed(4));
  const TJS = Number(result.Valute.TJS.Value.toFixed(4));
  const THB = Number(result.Valute.THB.Value.toFixed(4));
  const TRY = Number(result.Valute.TRY.Value.toFixed(4));
  const TMT = Number(result.Valute.TMT.Value.toFixed(4));
  const UZS = Number(result.Valute.UZS.Value.toFixed(4));
  const UAH = Number(result.Valute.UAH.Value.toFixed(4));
  const CZK = Number(result.Valute.CZK.Value.toFixed(4));
  const SEK = Number(result.Valute.SEK.Value.toFixed(4));
  const CHF = Number(result.Valute.CHF.Value.toFixed(4));
  const RSD = Number(result.Valute.RSD.Value.toFixed(4));
  const ZAR = Number(result.Valute.ZAR.Value.toFixed(4));
  const KRW = Number(result.Valute.KRW.Value.toFixed(4));
  const JPY = Number(result.Valute.JPY.Value.toFixed(4));
  
  return {
    AUD: AUD,
    AZN: AZN,
    GBP: GBP,
    AMD: AMD,
    BYN: BYN,
    BGN: BGN,
    BRL: BRL,
    HUF: HUF,
    VND: VND,
    HKD: HKD,
    GEL: GEL,
    DKK: DKK,
    AED: AED,
    USD: USD,
    EUR: EUR,
    EGP: EGP,
    INR: INR,
    IDR: IDR,
    KZT: KZT,
    CAD: CAD,
    QAR: QAR,
    KGS: KGS,
    CNY: CNY,
    MDL: MDL,
    NZD: NZD,
    NOK: NOK,
    PLN: PLN,
    RON: RON,
    XDR: XDR,
    SGD: SGD,
    TJS: TJS,
    THB: THB,
    TRY: TRY,
    TMT: TMT,
    UZS: UZS,
    UAH: UAH,
    CZK: CZK,
    SEK: SEK,
    CHF: CHF,
    RSD: RSD,
    ZAR: ZAR,
    KRW: KRW,
    JPY: JPY
  };
};

export function updateCurrencyRates(
  cbSetUSD: (value: SetStateAction<number>) => void, 
  cbSetEUR: (value: SetStateAction<number>) => void
) {
  let date = new Date();
  date.setDate(date.getDate()); console.log('date: ', date.toLocaleDateString());
  let yesterday = new Date();
  yesterday.setDate(date.getDate()-1); console.log('yesterday: ', yesterday.toLocaleDateString());
  const yesterdayIsWorking = isWorkingDay(yesterday.getFullYear(),yesterday.getMonth()+1,yesterday.getDate());
  console.log('%cisworking: %o','color: cyan', yesterdayIsWorking);
  console.log('%cdate: %o','color: cyan',date);
  lastWorkingDay(date.getFullYear(),date.getMonth() + 1,date.getDate());
  getCurrencies(date.toLocaleDateString()).then((result)=>{
    //console.log('%c result', 'color: red',result);
    // устанавливаем курс доллара и евро
    cbSetUSD(result.USD);
    cbSetEUR(result.EUR);
    //console.log('%c---USD: ', 'color: yellow;', result.USD);
    //console.log('%c---EUR: ', 'color: yellow;', result.EUR);
    
  }).catch((error) => {
    console.log('Ошибка: ', error);
  });
}


    
export interface CalcProps {
  header?: ReactNode;
  footer?: ReactNode;
  type?: number; // 0 - 395, 1 - penalty
  calcdata?: CalcData;
}

/*
export interface CalcProps {
  header?: ReactNode;
  footer?: ReactNode;
  sum?: ReactNode;
  posh?: ReactNode;
  setSum?: React.Dispatch<React.SetStateAction<string>>;
  setPosh?: React.Dispatch<React.SetStateAction<string>>;
  courtType?: string;
  code?: Code;
}
*/

export interface DebtRow {
  id: number;
  date: Date;
  sum: number;
}

export interface MainTableRow {
  id: number;
  date: Date;
  in?: number;
  inc?: number;
  dec?: number;
  out?: number; 
  percent?: number;
  penalty?: number;
}

export interface ShortTableRow {
  s: Date;
  e: Date;
  i?: number;
  inc?: number;
  dec?: number;
  o?: number; 
  pcnt?: number;
  plty?: number;
}

export const templateCalcTable: Template = {
  "schemas": [
    [
      {
        "name": "title",
        "type": "text",
        "content": "{\"header\":\"Расчёт процентов (неустойки)\"}",
        "position": {
          "x": 10,
          "y": 20
        },
        "width": 190,
        "height": 11.38,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 11,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "readOnly": false,
        "text": "{header} ",
        "variables": [
          "header"
        ],
        "required": false
      },
      {
        "name": "Calculation",
        "type": "table",
        "position": {
          "x": 10,
          "y": 32.31
        },
        "width": 189.71,
        "height": 27.5256,
        "content": "[[\"01.01.2025 - 10.01.2025\",\"100 000 + 0 - 0 = 100 000\",\"10 * 0.0575% * 100 000 =\",\"575.34\"],[\"11.01.2025 - 20.01.2025\",\"100 000 + 0 - 0 = 100 000\",\"10 * 0.0575% * 100 000 =\",\"575.34\"]]",
        "showHead": true,
        "head": [
          "Период",
          "Задолженность",
          "Расчет *",
          "Сумма **"
        ],
        "headWidthPercentages": [
          21.433477412893364,
          34.108929418586264,
          30.930938449914787,
          13.526654718605588
        ],
        "tableStyles": {
          "borderWidth": 0.1,
          "borderColor": "#808080"
        },
        "headStyles": {
          "fontName": "Roboto",
          "fontSize": 9,
          "characterSpacing": 0,
          "alignment": "left",
          "verticalAlignment": "middle",
          "lineHeight": 1,
          "fontColor": "#ffffff",
          "borderColor": "#808080",
          "backgroundColor": "#808080",
          "borderWidth": {
            "top": 0,
            "right": 0,
            "bottom": 0,
            "left": 0
          },
          "padding": {
            "top": 3,
            "right": 3,
            "bottom": 3,
            "left": 3
          }
        },
        "bodyStyles": {
          "fontName": "Roboto",
          "fontSize": 9,
          "characterSpacing": 0,
          "alignment": "left",
          "verticalAlignment": "middle",
          "lineHeight": 1,
          "fontColor": "#000000",
          "borderColor": "#808080",
          "backgroundColor": "",
          "alternateBackgroundColor": "#ffffff",
          "borderWidth": {
            "top": 0.1,
            "right": 0.1,
            "bottom": 0.1,
            "left": 0.1
          },
          "padding": {
            "top": 3,
            "right": 3,
            "bottom": 3,
            "left": 3
          }
        },
        "columnStyles": {
          "alignment": {
            "0": "center",
            "1": "left",
            "2": "left",
            "3": "left"
          }
        },
        "required": false,
        "readOnly": false
      },
      {
        "name": "sum",
        "type": "text",
        "content": "{\"sum\":\"Сумма процентов (неустойки)\"}",
        "position": {
          "x": 10,
          "y": 65.24
        },
        "width": 190,
        "height": 11.38,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 11,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "readOnly": false,
        "text": "{sum} ***",
        "variables": [
          "sum"
        ],
        "required": false
      },
      {
        "name": "comment",
        "type": "text",
        "content": "* День уплаты денежных средств включается в период просрочки исполнения денежного обязательства. Значение процента в день приводится до 4 знака после запятой.\n** Сумма процентов за период приводится до 4 знака после запятой.\n*** Общая сумма процентов приводится за 2 знака после запятой.",
        "position": {
          "x": 10,
          "y": 77.68
        },
        "width": 189.97,
        "height": 13.49,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 9,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false
      }
    ]
  ],
  "basePdf": {
    "width": 210,
    "height": 297,
    "padding": [
      20,
      10,
      20,
      10
    ]
  },
  "pdfmeVersion": "5.3.15"
};


/*
Ответ: День уплаты денежных средств включается в период просрочки исполнения денежного обязательства.
Такие разъяснения даны в п. 48 постановления Пленума Верховного Суда РФ от 24.03.2016 № 7, а также в "Обзоре судебной практики Верховного Суда РФ N 3 (2015)" (утв. Президиумом Верховного Суда РФ 25.11.2015) (Решение N ДК15-4).
Аналогичной позиции придерживался ранее ВАС РФ: постановление Президиума ВАС РФ от 28.01.2014 N 13222/13 по делу N А40-107594/12-47-1003.
*/

export interface InputsCalcTable {
  title: string;
  Calculation: [string, string, string, string][];
  sum: string;
  comment: string;
};

/**
 * Рабочий день
 * @param { number | string } year - Год
 * @param { number | string } month - Месяц в обычном представление (1 - январь, 2 - февраль, и т.д.) 
 * @param { number | string } day - День
 * @returns 
 */
export function isWorkingDay(year: string|number, month: string|number, day: string|number) {
  const monthtype = typeof month;
  const daytype= typeof day;
  const _year = nonWorkingDays.data.find(data=>data.year === Number(year));
  const _month = _year?.months.find(data=>data.month === (monthtype === "string" ? String(Number(month)).padStart(2,"0") : String(month).padStart(2,"0")));
  const _day = _month?.days.find(data=>data === (daytype === "string" ? day : String(day).padStart(2,"0")));
  return _day === undefined ? true: false;
}

/**
 * Поиск предыдущего рабочего дня
 * @param {number | string} year 
 * @param month 
 * @param day 
 * @returns 
 */
export function lastWorkingDay(year: string|number, month: string|number, day: string|number) {
  const currentDate = new Date(Number(year),Number(month)-1,Number(day));
  console.log(currentDate);
  let findedDate = new Date();
  let n = 0;
  let isworking = false;
  while (!isworking && n < 7) {
    let date = new Date();
    date.setDate(currentDate.getDate()-n);
    date.setMonth(currentDate.getMonth());
    date.setFullYear(currentDate.getFullYear());
    console.log(date.toLocaleDateString());
    console.log(date.getMonth()+1);
    isworking = isWorkingDay(date.getFullYear(), date.getMonth()+1, date.getDate());
    console.log(isworking);
    if (isworking) findedDate = date;
    n = n + 1;
    console.log(n);
  }
  console.log(findedDate);
  return findedDate;
}

//lastWorkingDay('2025','07','4');
//lastWorkingDay('2025','07','3');
//lastWorkingDay('2025','07','2');
//lastWorkingDay('2025','07','1');
lastWorkingDay('2025','06','28');

//lastWorkingDay(2025,7,1);

console.log(isWorkingDay(2025,6,28));
//console.log(isWorkingDay(2025,7,1));
//console.log(isWorkingDay(2025,6,30));
//console.log(isWorkingDay(2025,6,29));


export function hasDecimals(num: number): boolean { return num % 1 !== 0; }

export const reservedchars = ';/?:@&=+$,';
export const safechars = '-_.~';
export const specialchars = "!*'()";
export const notsafechars = '<>"{}|\^`';
export const B64chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

export type CalcData = [
  [number | undefined, number, number, number, number],
  [number, number],
  [Array<[number, number]>, Array<[number, number]>]
];

export function getCalcData(SP: string): CalcData | undefined {
  //let calcB64Data: string;
  let calcdata: CalcData = [
    [0, 0, 0, 0, 0],
    [0, 0],
    [[[0, 0]], [[0, 0]]]
  ];
  if (SP !== '') {
    console.log('%cПараметры запуска: %o', `color: ${colors.text}`, SP);

    const unOrderedParams: Param[] = [
      { name: 'clc', index: 0, value: '' },
      { name: 'bro', index: 0, value: '' }
    ];

    let orderedParams: Param[] = [];
    let params: Param[] = [];
    
    const arr: string[] = SP?.split(/clc|bro/) ?? [];
    
    if (arr.length < 2) return;  

    unOrderedParams.forEach((item) => {
      if (SP?.includes(item.name)) {
        item.index = SP.indexOf(item.name);
      }
    });

    orderedParams = unOrderedParams.sort( compareProps );
    orderedParams.forEach((item) => {
      if (item.index !== -1) params.push(item);
    })
    params.forEach((item) => {
      item.value = arr[params.findIndex(x => x.name === item.name)+1];  
    });

    console.log('%cOrdered Params: %o', `color: ${colors.text}`, orderedParams);
    orderedParams.forEach((item) => {
      if (item.name === 'clc') {
        console.log('%cclc: %o', `color: ${colors.text}`, item.value);
        calcdata = link2CalcData(item.value);
        //console.log('%cclc: %o', `color: ${colors.text}`, calcdata);
      }
    })

  } else {
    console.log('%cБез параметров запуска!', `color: ${colors.text}`);
  }
  return calcdata;  
}

/**
 * encode number to B64 string
 * @param {number} num - число 
 * @returns {string}
 */
export function NumToB64(num: number): string {
  let integer = !hasDecimals(num);
  let encoded = '';  
  if (integer) {
    while (num > 0) {  
      const remainder = num % B64chars.length;  
      encoded = B64chars[remainder] + encoded;  
      num = Math.floor(num / B64chars.length);  
    }  
  return encoded || '0'; // Возвращает '0', если число равно 0
  } else {
    let whole = Math.floor(num);
    let decimal = Math.floor((num - whole) * 100);
    let arr = [];
    while (whole > 0) {  
      const remainder = whole % B64chars.length;  
      encoded = B64chars[remainder] + encoded;  
      whole = Math.floor(whole / B64chars.length);  
    } 
    arr.push(encoded); encoded = '';
    while (decimal > 0) {
      const remainder = decimal % B64chars.length;  
      encoded = B64chars[remainder] + encoded;  
      decimal = Math.floor(decimal / B64chars.length);  
    }
    arr.push(encoded);
    return arr.length > 1 ? arr.join('.') : arr[0];
  }
}

/**
 * decode number from B64 string
 * @param {string} encoded - число в формате B64  
 * @returns 
 */
export function NumFromB64(encoded: string): number {  
  let arr = encoded.split('.');
  let decoded = 0;
  
  if (arr.length > 1) {
    let whole = 0;
    let decimal = 0;
    for (let i = 0; i < arr[0].length; i++) {  
      const char = arr[0][i];  
      const index = B64chars.indexOf(char);  
      whole = whole * B64chars.length + index;  
    }
    for (let i = 0; i < arr[1].length; i++) {  
      const char = arr[1][i];  
      const index = B64chars.indexOf(char);  
      decimal = decimal * B64chars.length + index;  
    }
    decoded = whole + decimal / 100;
  } else {
    for (let i = 0; i < encoded.length; i++) {  
      const char = encoded[i];  
      const index = B64chars.indexOf(char);  
      decoded = decoded * B64chars.length + index;  
    }  
  }
    
  return decoded;  
}


export function shortDate(date: Date): string {
  const dd = (date.getDate().toString()).padStart(2, '0');
  const mm = (date.getMonth()+1).toString().padStart(2, '0');
  const yy = Number(date.getFullYear())-2000;
  return ''+dd+'.'+mm+'.'+yy;
}

export function getDateFromNum(num: number): Date {
  const date = num.toString().padStart(6, '0').split(/(?=(?:..)*$)/);  
  date[2] = (Number(date[2]) + 2000).toString();
  const result = new Date(date[2]+'-'+date[1]+'-'+date[0]+'T00:00:00');
  return new Date(result);
}

export function fromCalcB64Data(data: [
        string,
        string,
        string[],
        string[]
]): CalcData {

    const arr = data[0].split('.');
    const type = NumFromB64(arr[0]);
    const debt = NumFromB64(arr[1]);
    const currency = NumFromB64(arr[2]);
    const rate = NumFromB64(arr[3]);
    const periodtype = NumFromB64(arr[4]);
  
    const decrease = data[2].map((item) => {
        const arr = item.split('.');
        const result: [number, number] = [ NumFromB64(arr[0]), NumFromB64(arr[1]) ];
        return result;
      }
    );
    
    const increase = data[3].map((item) => {
      const arr = item.split('.');
        const result: [number, number] = [ NumFromB64(arr[0]), NumFromB64(arr[1]) ];
        return result;
      }
    );

    const arr2: string[] = data[1].split('.');
    console.log('arr2: ', arr2);
    console.log(NumFromB64(arr2[0]).toString().padStart(6, '0'));
    console.log(NumFromB64(arr2[1]).toString().padStart(6, '0'));

    console.log(getDateFromNum(NumFromB64(arr2[0])));

    const strDateFrom = NumFromB64(arr2[0]).toString().padStart(6, '0').split(/(?=(?:..)*$)/);  
    const strDateTo = NumFromB64(arr2[1]).toString().padStart(6, '0').split(/(?=(?:..)*$)/);

    strDateFrom[2] = (Number(strDateFrom[2]) + 2000).toString();
    strDateTo[2] = (Number(strDateTo[2]) + 2000).toString();

    console.log(strDateFrom);
    console.log(strDateTo);
    const dateFrom = getDateFromNum(NumFromB64(arr2[0]));
    const dateTo = getDateFromNum(NumFromB64(arr2[1]));
    console.log('dateFrom: ', dateFrom);
    console.log('dateTo: ', dateTo);

    const period: [number, number] = [NumFromB64(arr2[0]), NumFromB64(arr2[1])];

  return [
    [type, debt, currency, rate, periodtype],
    period,
    [decrease, increase]
  ]
}

export function checkUTF8(text:string) {
    var utf8Text = text;
    try {
        // Try to convert to utf-8
        utf8Text = decodeURIComponent(escape(text));
        // If the conversion succeeds, text is not utf-8
    }catch(e) {
        // console.log(e.message); // URI malformed
        // This exception means text is utf-8
    }
    return utf8Text; // returned text is always utf-8
}

export function sharelink(id: string | undefined, crushedCalcData: string) {
  const applink = 'https://t.me/' + import.meta.env.VITE_BOT_NAME + '/' + import.meta.env.VITE_APP_NAME + '?startapp=';
  const bro = id ? 'bro' + id : ''
  const url = applink + 'clc' + crushedCalcData + bro;
  return url;
}


  /*
  function doCalcData(): [
        [number | undefined, number, number, number, number],
        [number, number],
        [Array<[number, number]>, Array<[number, number]>]
  ] {
    const decrease = DebtDecrease.map((item) => {
        const result: [number, number] = [ Number(item.date.toLocaleDateString().replace('.','').replace('.','')), item.sum ];
        return result;
      }
    );
    const increase = DebtIncrease.map((item) => {
      const result: [number, number] = [ Number(item.date.toLocaleDateString().replace('.','').replace('.','')), item.sum ];
        return result;
      }
    );

    const from = datefrom !== undefined ? Number(datefrom.toLocaleDateString().replace('.','').replace('.','')) : 0;
    const to = dateto !== undefined ? Number(dateto.toLocaleDateString().replace('.','').replace('.','')) : 0;

    return  [
              [type, debt, currency, rate, periodtype],
              [from, to],
              [decrease, increase]
            ];
  }
  */


export function doCalcB64Data(
  datefrom: Date | undefined,
  dateto: Date | undefined,
  type: number | undefined,
  debt: number,
  currency: number,
  rate: number,
  periodtype: number,
  DebtDecrease: DebtRow[],
  DebtIncrease: DebtRow[]
): [
      string,
      string,
      string[],
      string[]
  ] {
    // использовать вместо вложенного массива строку разделенными точками
    const decrease = DebtDecrease.map((item) => {
        const result: string = NumToB64(Number(shortDate(item.date).replace('.','').replace('.',''))) + '.' + NumToB64(item.sum);
        return result;
      }
    );
    const increase = DebtIncrease.map((item) => {
      const result: string = NumToB64(Number(shortDate(item.date).replace('.','').replace('.',''))) + '.' + NumToB64(item.sum);
        return result;
      }
    );

    const from = datefrom !== undefined ? NumToB64(Number(shortDate(datefrom).replace('.','').replace('.',''))) : '0';
    const to = dateto !== undefined ? NumToB64(Number(shortDate(dateto).replace('.','').replace('.',''))) : '0';

    const base = (type ? NumToB64(type) : '') + '.' +
                  NumToB64(debt) + '.' +
                  NumToB64(currency) + '.' +
                  NumToB64(rate) + '.' +
                  NumToB64(periodtype);
    const period = (from + '.' + to);

    return  [
              // вместо массива строка, разделенная точками
              base,
              period,
              decrease,
              increase
            ];
}

// Сжатие параметров расчёта для url
/*
function crushedCalcData() {
  const calcData = doCalcData();
  const calcB64Data = doCalcB64Data();
  const crushed = jsoncrush.default.crush(JSON.stringify(calcData)).replace(/\u0001/g, '%01');
  setCrushedData(crushed);
  const crushedB64 = jsoncrush.default.crush(JSON.stringify(calcB64Data)).replace(/\u0001/g, '%01');
  return crushed;
}
*/

export function crushedCalcB64Data(
  datefrom: Date | undefined,
  dateto: Date | undefined,
  type: number | undefined,
  debt: number,
  currency: number,
  rate: number,
  periodtype: number,
  debtdecrease: DebtRow[],
  debtincrease: DebtRow[],
  setCrushedData: React.Dispatch<React.SetStateAction<string>>
) {
  const calcB64Data = doCalcB64Data(datefrom, dateto, type, debt, currency, rate, periodtype, debtdecrease, debtincrease);
  const crushedB64 = jsoncrush.default.crush(JSON.stringify(calcB64Data)).replace(/\u0001/g, '%01');
  setCrushedData(crushedB64);
  return crushedB64;
}

// Получение параметров расчёта из url
export function uncrushedCalcData(crushed?: string, crushedData?: string) {
  const uncrushed = crushed !== undefined ? JSON.parse(jsoncrush.default.uncrush(crushed.replace(/%01/g, '\u0001'))) : crushedData;
  return uncrushed;
}


//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////


export type Param = {
  name: string,
  index: number,
  value: string
}

/*export const calcPosh = (
    value: string,
    courtType: string,
    benefitsSwitch?: boolean,
    discount30Switch?: boolean,
    discount50Switch?: boolean
  ) => {
  let _sum;
  if (typeof(value) === 'string') {
    _sum = Number(value.replace(',','.'));
  } else {
    _sum = Number(value);
  }
  let gospSou = 0;
  let gospArb = 0;
  let s = 0; // step
  let b = 0; // base
  let e = 0; // exceed
  let p = 0; // percent
  let f = 0; // fix
  let withBenefits = 0; 
  let withDiscount30 = 0;
  let withDiscount50 = 0;

  if (courtType === 'obsh' || courtType === '') {
    if (_sum > 0 && _sum <= 100000) {
      f = 4000;
      gospSou = f; s = 1}
    if (_sum > 100000 && _sum <= 300000) {
      b = 100000; e = _sum - b; f = 4000; p = 3;
      gospSou = (e) / 100 * p + f; s = 2;
    }
    if (_sum > 300000 && _sum <= 500000) {
      b = 300000; e = _sum - b; f = 10000; p = 2.5;
      gospSou = (e) / 100 * p + f; s = 3;
    }
    if (_sum > 500000 && _sum <= 1000000) {
      b = 500000; e = _sum - b; f = 15000; p = 2;
      gospSou = (e) / 100 * p + f; s = 4;
    }
    if (_sum > 1000000 && _sum <= 3000000) {
      b = 1000000; e = _sum - b; f = 25000; p = 1;
      gospSou = (e) / 100 * p + f; s = 5;
    }
    if (_sum > 3000000 && _sum <= 8000000) {
      b = 3000000; e = _sum - b; f = 45000; p = 0.7;
      gospSou = (e) / 100 * p + f; s = 6;
    }
    if (_sum > 8000000 && _sum <= 24000000) {
      b = 8000000; e = _sum - b; f = 80000; p = 0.35;
      gospSou = (e) / 100 * p + f; s = 7;
    }
    if (_sum > 24000000 && _sum <= 50000000) {
      b = 24000000; e = _sum - b; f = 136000; p = 0.3;
      gospSou = (e) / 100 * p + f; s = 8;
    }
    if (_sum > 50000000 && _sum <= 100000000) {
      b = 50000000; e = _sum - b; f = 214000; p = 0.2;
      gospSou = (e) / 100 * p + f; s = 9;
    }
    if (_sum > 100000000) {
      b = 100000000; e = _sum - b; f = 314000; p = 0.15;
      gospSou = (e) / 100 * p + f; s = 10;
    }
    if (gospSou > 900000) gospSou = 900000;

    let benefitsSum: number = 25000;
    let benefits: number = gospSou - benefitsSum;
    let discount30: number = gospSou * 0.3; 

    if (benefitsSwitch && benefits > 0) { gospSou = benefits; } else if (benefitsSwitch) { gospSou = 0; }
    if (discount30Switch) gospSou -= discount30;

    withBenefits = (benefits) > 0 ? (benefits) : 0;
    withDiscount30 = gospSou - discount30;
    return {
      step: s,
      gosp: gospSou.toFixed(0),
      base: b.toFixed(2),
      exceed: e.toFixed(2),
      percent: p.toFixed(2),
      fix: f.toFixed(2),
      discount30: discount30.toFixed(2),
      discount50: 0,
      benefits: benefitsSum,
      withBenefits: withBenefits.toFixed(2),
      withDiscount30: withDiscount30.toFixed(2),
      withDiscount50: gospSou.toFixed(2),
    }
  } else {
    if (_sum > 0 && _sum <= 100000) {
      f = 10000;
      gospArb = f; s = 1}
    if (_sum > 100000 && _sum <= 1000000) {
      b = 100000; e = _sum - b; f = 10000; p = 5;
      gospArb = (e) / 100 * p + f; s = 2;
    }
    if (_sum > 1000000 && _sum <= 10000000) {
      b = 1000000; e = _sum - b; f = 55000; p = 3;
      gospArb = (e) / 100 * p + f; s = 3;
    }
    if (_sum > 10000000 && _sum <= 50000000) {
      b = 10000000; e = _sum - b; f = 325000; p = 1;
      gospArb = (_sum - 10000000) / 100 * p + f; s = 4;
    }
    if (_sum > 50000000) {
      b = 50000000; e = _sum - b; f = 725000; p = 0.5;
      gospArb = (e) / 100 * p + f; s = 5;
    }
    if (gospArb > 10000000) gospArb = 10000000;

    let benefitsSum = 55000;
    let benefits = gospArb - benefitsSum;
    let discount30 = gospArb * 0.3; 
    let discount50 = gospArb * 0.5;

    if (benefitsSwitch && benefits > 0) { gospArb = benefits; } else if (benefitsSwitch) { gospArb = 0; }
    if (discount30Switch) gospArb -= discount30;
    if (discount50Switch) gospArb -= discount50;

    withBenefits = (benefits) > 0 ? (benefits) : 0;
    withDiscount30 = gospArb - discount30;
    withDiscount50 = gospArb - discount50;

    return {
      step: s,
      gosp: gospArb.toFixed(0),
      base: b.toFixed(2),
      exceed: e.toFixed(2),
      percent: p.toFixed(2),
      fix: f.toFixed(2),
      discount30: discount30.toFixed(2),
      discount50: discount50.toFixed(2),
      benefits: benefitsSum,
      withBenefits: withBenefits.toFixed(2),
      withDiscount30: withDiscount30.toFixed(2),
      withDiscount50: withDiscount50.toFixed(2),
    }
  }
}*/

export function human(dosum: any) { // разрядность
  // исправить
  let sum = ''+dosum;
  sum = sum.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') // разрядность
  if (sum.indexOf('.')!==-1) {						   // к десяткам копеек добавляем ноль
    let b=sum.substring(sum.indexOf('.'),sum.length)
    if (b.length===2) sum+="0"
  }
  if (sum.indexOf(',')!==-1) {						   // к десяткам копеек добавляем ноль
    let b=sum.substring(sum.indexOf(','),sum.length)
    if (b.length===2) sum+='0';
  }
  sum = sum.replace(/^00\./,'0.'); // меняем 00. на 0,
  sum = sum.replace(/^00,/,'0.');
  sum = sum.replace(/\./g,','); // меняем тчк на зпт
  return sum;
}

export function prepareHash(value: string) {
  if (value.indexOf('##')!=-1) value = value.substring(0,value.indexOf('##'))
  if (value.indexOf('%23%23')!=-1) value = value.substring(0,value.indexOf('%23%23'))
  value = value.replace(/%2C/g,',').replace(/&amp;/g,'&').replace(/%3B/g,";")
  if (value.indexOf('&&')!=-1) value = value.substring(0,value.indexOf('&&'))
  if (value.indexOf('h')!=-1) value = value.substring(0,value.indexOf('h'))
  return value.replace(/%20/g,"");
}

export function cutlink(a: string, locationhash: string) {
  let str = locationhash;
  let a1 = str.substring(str.indexOf(a) + a.length);
  if (a1.indexOf("a") !== -1) a1 = a1.substring(0, a1.indexOf("a"));
  if (a1.indexOf("g") !== -1) a1 = a1.substring(0, a1.indexOf("g"));
  a1 = a1.replace(/[ntjrfh<>]/gi, '');
  a1 = a1.replace(/u/gi, '+').replace(/i/gi, '/').replace(/m/gi, '*').replace(/o/gi, '(').replace(/e/gi, ')');
  a1 = a1.replace(/w/gi, '00').replace(/k/gi, '000').replace(/c/gi, '0000').replace(/p/gi, '00000').replace(/b/gi, '000000').replace(/s/gi, '0000000').replace(/v/gi, '00000000').replace(/d/gi, '000000000');
  return a1;
}

export type Code = {
  benefitsSwitch: boolean;
  discount30Switch: boolean;
  discount50Switch: boolean;
  sou: string;
  arb: string;
}

export const link2code: (hash: string) => Code = (hash: string) => { 
  let benefitsSwitch = false;
  //let benefitsSwitch2 = false;
  let discount30Switch = false;
  //let discount30Switch2 = false;
  let discount50Switch = false;
  let sou = ''; let arb = ''; //let oraz = ''; let yrtb = '';

  if ( hash.indexOf('n') != -1 ) { benefitsSwitch = true; }
  else if ( hash.indexOf('t') != -1 ) { discount30Switch = true; }

  if ( hash.indexOf('g') != -1 ) {
    sou = human(cutlink('g', hash));
  }

  if ( hash.indexOf('j') != -1 ) { benefitsSwitch = true; }
  else if ( hash.indexOf('r') != -1 ) { discount30Switch = true; }
  else if ( hash.indexOf('f') != -1 ) { discount50Switch = true; }

  if ( hash.indexOf('a') != -1 ) {
    arb = human(cutlink('a', hash));
    //oraz = hash.substring(1, hash.length)+'h'+ (( location.hash.indexOf('hf') != -1 ) ? 'f' : '')
    //yrtb = oraz;
  }

  return {
    benefitsSwitch,
    //benefitsSwitch2: benefitsSwitch2,
    discount30Switch,
    //discount30Switch2: discount30Switch2,
    discount50Switch,
    sou,
    arb,
    //oraz: oraz,
    //yrtb: yrtb
  } as Code;
}

export const link2CalcData: (hash: string) => CalcData = (hash: string) => { 
  const getdebug = false;
  getdebug && console.log('hash: ', hash);
  let calcdata: CalcData = [
    [0,0,0,0,0],  // 0
    [0,0],        // 1
    [             // 2
      [[0,0]],    // 2, 0
      [[0,0]]     // 2, 1
    ]
  ];
  
  calcdata = fromCalcB64Data(uncrushedCalcData(hash));

  getdebug && console.log('calcdata: ', calcdata);
  
  const type = calcdata[0][0];
  const debt = calcdata[0][1];
  const currency = calcdata[0][2];
  const rate = calcdata[0][3];
  const periodtype = calcdata[0][4];
  const period: [number, number] = calcdata[1];
  const decrease: Array<[number, number]> = calcdata[2][0];
  const increase: Array<[number, number]> = calcdata[2][1];

  getdebug && console.log('type: ', type);
  getdebug && console.log('debt: ', debt);
  getdebug && console.log('currency: ', currencies[currency-1]);
  getdebug && console.log(`rate: ${rate}%`);
  getdebug && console.log(`periodtype: ${periodtype === 1 ? 'День': periodtype === 2 ? 'Год': ''}`);
  getdebug && console.log(`period с ${getDateFromNum(period[0]).toLocaleDateString()} по ${getDateFromNum(period[1]).toLocaleDateString()}`);
  getdebug && console.log('decrease');
  getdebug && decrease.map((item) => {
    console.log(`${getDateFromNum(item[0]).toLocaleDateString()}: ${item[1]}`);
  })
  getdebug && console.log('increase');
  getdebug && increase.map((item) => {
    console.log(`${getDateFromNum(item[0]).toLocaleDateString()}: ${item[1]}`);
  })

  return calcdata;
}

export function compareProps( a: Param, b: Param ) {
  if ( a.index < b.index ) {
    return -1;
  }
  if ( a.index > b.index ) {
    return 1;
  }
  return 0;
}

export function getCode(SP: string) {
  let code: Code = {
    benefitsSwitch: false,
    discount30Switch: false,
    discount50Switch: false,
    sou: '',
    arb: ''
  };

  if (SP !== '') {
    console.log('%cПараметры запуска: %o', `color: ${colors.text}`, SP);

    const unOrderedParams: Param[] = [
      { name: 'clc', index: 0, value: '' },
      { name: 'bro', index: 0, value: '' }
    ];

    let orderedParams: Param[] = [];
    let params: Param[] = [];
    
    const arr: string[] = SP?.split(/clc|bro/) ?? [];
    
    if (arr.length < 2) return;  

    unOrderedParams.forEach((item) => {
      if (SP?.includes(item.name)) {
        item.index = SP.indexOf(item.name);
      }
    });

    orderedParams = unOrderedParams.sort( compareProps );
    orderedParams.forEach((item) => {
      if (item.index !== -1) params.push(item);
    })
    params.forEach((item) => {
      item.value = arr[params.findIndex(x => x.name === item.name)+1];  
    });

    console.log('%cOrdered Params: %o', `color: ${colors.text}`, orderedParams);
    orderedParams.forEach((item) => {
      if (item.name === 'clc') {
        code = link2code(prepareHash(item.value));
        console.log('%cclc: %o', `color: ${colors.text}`, code);
      }
      if (item.name === 'bro') {
        code = link2code(prepareHash(item.value));
        console.log('%cbro: %o', `color: ${colors.text}`, code);
      }
    })

  } else {
    console.log('%cБез параметров запуска!', `color: ${colors.text}`);
  }
  return code;
}


export function getOrderedParams(SP: string, arr: string[]) {
  console.log('%cSP: %o', `color: white; background-color: blue`, SP);
  console.log('%carr: %o', `color: white; background-color: blue`, arr);
  let orderedParams: Param[] = [];
  let params: Param[] = [];

  const unOrderedParams: Param[] = [
    { name: 'clc', index: -1, value: '' },
    { name: 'bro', index: -1, value: '' }
  ];
      
  if (arr.length < 2 && arr.length !== 0) return;  
  if (arr.length !== 0) {
    unOrderedParams.forEach((item) => {
      console.log('%citem: %o', `color: ${colors.text}`, item);
      if (SP?.includes(item.name)) {
        const index = SP.indexOf(item.name);
        
        if (item.name === 'bro') {
          item.index = index;
          const bro = NumFromB64(item.value).toString();
          item.value = bro;
        }

        if (item.name === 'clc') {
          item.index = index;
        }
        console.log('%citem.name: %o', `color: ${colors.text}`, item.name);
        console.log('%citem.index: %o', `color: ${colors.text}`, item.index);
      }
    });
    console.log('%cunOrderedParams: %o', `color: ${colors.text}`, unOrderedParams);
    orderedParams = unOrderedParams.sort( compareProps );
    
    orderedParams.forEach((item) => {
      if (item.index !== -1) params.push(item);
    })
    params.forEach((item) => {
      console.log('%citem: %o', `color: ${colors.text}`, item);
      console.log('%carr: %o', `color: ${colors.text}`, arr);
      item.value = arr[params.findIndex(x => x.name === item.name)+1];  
    });

    console.log('%cParams: %o', `color: ${colors.text}`, params);
  }

return (params);
}