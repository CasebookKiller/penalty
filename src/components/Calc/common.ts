console.log('Загружен модуль с функциями...')
import { Template } from '@pdfme/common';
import * as keyrates from './keyrates.json';
//console.log(keyrates);

//import { init, themeParams, miniApp } from '@telegram-apps/sdk-react';

//init(); console.log('init');
//themeParams.mountSync(); console.log('themeParams');
//miniApp.mountSync(); console.log('miniApp');

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


export async function getCurrencies() {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const rateRequestUrl = `https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`;
  // const rateRequestUrl = 'https://www.cbr-xml-daily.ru/daily_json.js';
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

    
export interface CalcProps {
  type?: number; // 0 - 395, 1 - penalty
}

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
