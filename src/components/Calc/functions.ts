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