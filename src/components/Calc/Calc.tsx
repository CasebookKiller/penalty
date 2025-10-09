//https://pdfme.com/docs/getting-started
//https://stackoverflow.com/questions/51202460/inlinequeryresultarticle-of-answerinlinequery-in-telegram-bot-api-with-google-ap

import * as RU from '../../locale/ru.json';
import * as common from './common';

import React, { FC, useEffect, useRef, useState } from 'react';

//text, barcodes, image,
import { Template } from '@pdfme/common';
import { text, table, /*date*/ } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';

import { openTelegramLink, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { postEvent, on } from '@telegram-apps/bridge';

import { addLocale, locale, PrimeReactProvider } from 'primereact/api';
import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { classNames } from 'primereact/utils';

import { AppSection } from '../AppSection/AppSection';

import { QRCodeStyling } from '@liquid-js/qr-code-styling';

import { botMethod, PreparedInlineMessage, deleteMessage } from '@/api/bot/methods';

import './Calc.css';
//import { BoxArrowRight, ChatLeftDots, QrCodeScan } from 'react-bootstrap-icons';
import { Dialog } from 'primereact/dialog';

import { PrimeReactFlex } from '@/components/PrimeReactFlex/PrimeReactFlex';

addLocale('ru', RU.ru);
locale('ru');

const debtdecrease = [
  // после отладки удалить
  { id: 1, date: common.dateFromString('11.02.2025'), sum: 1000 },
  { id: 2, date: common.dateFromString('11.03.2025'), sum: 2000 },
  { id: 3, date: common.dateFromString('11.04.2025'), sum: 3000 },
];

const debtincrease = [
  // после отладки удалить
  { id: 1, date: common.dateFromString('12.02.2025'), sum: 3000 },
  { id: 2, date: common.dateFromString('12.03.2025'), sum: 2000 },
  { id: 3, date: common.dateFromString('12.04.2025'), sum: 1000 },
];

function doGeneratePdf(
  template: Template,                 // Шаблон
  inputs: common.InputsCalcTable[],   // Входные данные
  InitialData: any,                   // Данные инициализации приложения
  cb: common.IDoWithPDF,                     // Функция обратного вызова
  caption?: string,                   // Заголовок
  //type?: number                     // Тип расчета
) {
  
  generate({
    template: template,
    inputs: inputs,
    plugins: { Text: text, Table: table },
  }).then((pdf: any) => {
    // Блоб файла PDF с расчётом
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    
    function logresult(result: any) {
      // функция для отслеживания результата обратного вызова  
      console.log('Обработка результата: ', result)
    }
    const ID = InitialData || '';
    // Отправляем PDF в функцию-обработчик
    // передача blob PDF в функцию обратного вызова
    const params: common.IParamsDoWithPDF = {
      sendAdmin: false,                             // Признак отправки админу
      cb: logresult,                                // обработка результата обратного вызова
      caption: caption || 'Документ с расчётом'     // заголовок документа
    };
    cb(blob, ID, params); 
    // console.log('PDF: ', pdf);
  });
}

/*** --- оптимизировать совместно с sendPreparedBlob */
function sendDocumentBlob(
  blob: Blob,
  InitialData: any,
  params?: common.IParamsDoWithPDF
) {
  const ID = InitialData || '';

  // обрабатываем Blob PDF
  window.open(URL.createObjectURL(blob));

  const FD = new FormData();
  let chat_id = ID?.user?.id.toString() || '';
  
  // Если отправка сообщения админу, то изменяем chat_id на админский ID
  if (params?.sendAdmin) {
    console.log('sendAdmin: ', params?.sendAdmin);
    const admin_id = import.meta.env.VITE_ADMIN_ID;
    console.log('admin_id:', admin_id);
    chat_id = admin_id;
  }
  
  //FD.append('business_connection_id', business_connection_id);                    // необязательный параметр, уникальный идентификатор бизнес-подключения, от имени которого будет отправлено сообщение
  FD.append('chat_id', chat_id);                                                    // обязательный параметр, идентификатор целевого чата, в который будет отправлен файл
  //FD.append('message_thread_id', message_thread_id);                              // необязательный параметр, идентификатор целевой ветки (темы) форума, в который будет отправлен файл
  FD.append('document', blob, 'calculation.pdf');                                   // обязательный параметр, файл для отправки
  //FD.append('thumbnail', thumbnail, 'calculation.png');                           // необязательный параметр, эскиз отправленного файла
  FD.append('caption', params && params?.caption || '');                            // необязательный параметр, заголовок документа 
  //FD.append('parse_mode', parse_mode);                                            // необязательный параметр, режим для анализа сущностей в заголовке документа
  //FD.append('caption_entities', caption_entities);                                // необязательный параметр, список специальных сущностей
  //FD.append('disable_content_type_detection', disable_content_type_detection);    // необязательный параметр, отключает автоматическое определение типа контента на стороне сервера для файлов, загруженных с помощью multipart/form-data
  //FD.append('disable_notification', disable_notification);                        // необязательный параметр,
  //FD.append('protect_content', protect_content);                                  // необязательный параметр, защищает содержимое отправленного сообщения от пересылки и сохранения
  //FD.append('allow_paid_broadcast', pallow_paid_broadcast);                       // необязательный параметр
  //FD.append('message_effect_id', message_effect_id);                              // необязательный параметр
  //FD.append('reply_parameters', reply_parameters);                                // необязательный параметр
  
  //////////////////////////
  // при вызове только savePreparedInlineMessage расчёт отправлять боту, с последующим удалением сообщения кэшированного файла
  // deleteMessage с обязательными мараметрами chat_id и message_id
  
  botMethod(
    'sendDocument',
    FD
  ).then((result: any) => {
    const payload = result.payload;
    console.log('payload:' , payload);
    // получение id файла с документом
    console.log(result.payload?.result.document.file_id);
    
    if (openTelegramLink.isAvailable()) {
      // перейдти по ссылке в телеграм бот
      openTelegramLink('https://t.me/' + import.meta.env.VITE_BOT_NAME);
    }
    params?.cb && params.cb(result);
    
    if (params?.sendAdmin) {
      // после отправки документа админу, удаляем сообщение с ним
      console.log('удаляем сообщение: ', payload.result.message_id);
      
      deleteMessage(chat_id, payload.result.message_id);
    }
  }).catch((error)=>{
    console.log(error);
  });

}

/*** --- оптимизировать совместно с sendDocumentBlob*/
function sendPreparedBlob(
  blob: Blob,
  InitialData: any,
  params?: common.IParamsDoWithPDF
) {
  // Выполнить все Этапы
  // 1. Создание документа
  // 2. Получение документа в формате Blob
  // 3. Отправка документа боту
  // 4. Получение id отправленного документа
  // 5. Создание InlineQueryResultCachedDocument
  // 6, savePreparedInlineMessage
  // 7. Удаление сообщения у бота
  const ID = InitialData || '';
  console.log(blob);
  // обрабатываем Blob PDF
   
  // создание документа для сохранения его на сервере telegram
  let doccached = {
    type: 'document',                                           // тип результата встроенного запроса
    id: 2,                                                      // уникальный идентификатор этого результата
    title: params && params.caption || 'Расчет неустойки (процентов)',                      // название для результата встроенного запроса
    description: 'Расчет на основании введенных параметров',                // краткое описание результата
    caption: params && params.caption || 'Расчет неустойки (процентов)',                    // заголовок отправляемого документа
    document_file_id: '',                                       // Действительный идентификатор для этого файла
  };

  const SavedFD = new FormData();
  const chat_id = ID?.user?.id.toString() || '';
  //const admin_id = import.meta.env.VITE_ADMIN_ID;
  let saved_chat_id = chat_id;
  //SavedFD.append('business_connection_id', business_connection_id);                    // необязательный параметр, уникальный идентификатор бизнес-подключения, от имени которого будет отправлено сообщение
  SavedFD.append('chat_id', saved_chat_id);                                                    // обязательный параметр, идентификатор целевого чата, в который будет отправлен файл
  //SavedFD.append('message_thread_id', message_thread_id);                              // необязательный параметр, идентификатор целевой ветки (темы) форума, в который будет отправлен файл
  SavedFD.append('document', blob, 'calculation.pdf');                                   // обязательный параметр, файл для отправки
  //SavedFD.append('thumbnail', thumbnail, 'calculation.png');                           // необязательный параметр, эскиз отправленного файла
  SavedFD.append('caption', params && params?.caption || '');                            // необязательный параметр, заголовок документа 
  console.log('%c caption: ', `color: white; background-color: green;`, params && params?.caption || '');
  //SavedFD.append('parse_mode', parse_mode);                                            // необязательный параметр, режим для анализа сущностей в заголовке документа
  //SavedFD.append('caption_entities', caption_entities);                                // необязательный параметр, список специальных сущностей
  //SavedFD.append('disable_content_type_detection', disable_content_type_detection);    // необязательный параметр, отключает автоматическое определение типа контента на стороне сервера для файлов, загруженных с помощью multipart/form-data
  //SavedFD.append('disable_notification', disable_notification);                        // необязательный параметр,
  //SavedFD.append('protect_content', protect_content);                                  // необязательный параметр, защищает содержимое отправленного сообщения от пересылки и сохранения
  //SavedFD.append('allow_paid_broadcast', pallow_paid_broadcast);                       // необязательный параметр
  //SavedFD.append('message_effect_id', message_effect_id);                              // необязательный параметр
  //SavedFD.append('reply_parameters', reply_parameters);                                // необязательный параметр
  
  // **************************************************
  botMethod(
    'sendDocument',
    SavedFD
  ).then((result: any) => {
    const payload = result.payload;
    console.log('%c payload: ', 'color: white; background-color: red;', payload);
    // получение id файла с документом
    doccached.document_file_id = result.payload?.result.document.file_id;
    console.log('%c saved id: %o','background: aquamarine; color: black;', doccached.document_file_id);
    
    //params?.cb && params.cb(result);

    const FD = new FormData();

    if (params?.sendAdmin) {
      // Если указана отправка сообщения админу
    }

    FD.append('user_id', ID?.user?.id.toString() || '');
    FD.append('result', JSON.stringify(doccached));
    FD.append('allow_user_chats', 'true');
    FD.append('allow_bot_chats', 'true');
    FD.append('allow_group_chats', 'true');
    FD.append('allow_channel_chats', 'true');
    
    botMethod(
      'savePreparedInlineMessage',
      FD
    ).then((result: any) => {

      window.addEventListener('message', ({ data }) => {
        console.log(data);
      });

      console.log(result);
      params?.cb && params.cb(result); // объединить вывод в консоль

      const PIM: PreparedInlineMessage = result.payload?.result;
      console.log('PIM.id: ',PIM.id);
      postEvent('web_app_send_prepared_message', {
        id: PIM.id.toString()
      });
      on('prepared_message_sent', (data) => { 
        console.log(data);
        // убрать setEventStatus
        //setEventStatus && setEventStatus(String(data));
        deleteMessage(chat_id, payload.result.message_id);
      });
      on('prepared_message_failed', (data) => {
        console.log(data);
        //setEventStatus && setEventStatus(String(data));
      });
    }).catch((error) => {
      console.log(error);
    });
    
  }).catch((error)=>{
    console.log(error);
  });
  // **************************************************
  console.log('doccached: ', doccached);
}

// Функция на замену doPDF и sendPDF
function doWithCalculation(
  mainTable: common.MainTableRow[],
  InitialData?: any,
  func?: common.IDoWithPDF,
  setEventStatus?: (data: string) => void,
  caption?: string
) {

  const EventStatus = 'Обработка результата расчёта ...';
  setEventStatus && setEventStatus(EventStatus);
  const ID = InitialData || '';
  
  let currentShortRow: common.ShortTableRow | null = null; // текущая строка

  let lastShortRow: common.ShortTableRow | null = null; // предыдущая строка в группе
  let lastRow: common.MainTableRow | null = null; // предыдущая строка главной таблицы
  let lastDaysInYear = 365; // количество дней в году по умолчанию

  let rows: common.ShortTableRow[] = [];

  mainTable.map((row, index, array) => {
    // количество дней в году для текущей даты
    const daysInYear = common.getDayOfYear(new Date(row.date.getFullYear(), 11, 31));
    
    // проверка на изменение ключевых параметров
    const setNewShortRow = 
          lastRow?.in !== row.in || 
          lastRow?.out !== row.out || 
          lastRow?.percent !== row.percent ||
          lastDaysInYear !== daysInYear; // проверка на изменение дней в году

    if (setNewShortRow) {
      currentShortRow = {
        s: row.date,
        e: row.date,
        i: row.in,
        inc: row.inc,
        dec: row.dec,
        o: row.out,
        pcnt: row.percent,
        plty: row.penalty  
      } as common.ShortTableRow;
      if (lastShortRow) {
        rows.push(lastShortRow);
      } else {
        //console.log('%clastShortRow: %o', 'color: yellow', lastShortRow);
      }
    } else {
      if (!currentShortRow) return;
      const penalty = row.penalty === undefined ? 0 : row.penalty;
      const sumPenalty = currentShortRow?.plty ? currentShortRow?.plty + penalty : 0 + penalty;
      currentShortRow = {
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
    } as common.ShortTableRow;

    lastShortRow = currentShortRow;
    // после проверки текущий ряд сохраняем в переменную
    lastRow = row;
    lastDaysInYear = daysInYear;
  });

  let sum = 0;

  // do inputs
  const inputsArr: [string,string,string,string][] = [];
  rows.forEach(row => {
    const start = row.s.toLocaleDateString();
    const end = row.e.toLocaleDateString();
    
    const oneDay = 1000 * 60 * 60 * 24;
    // Вычисление разницы во времени между двумя датами
    const diffInTime = row.e.getTime() - row.s.getTime();
    // Вычисление количества дней между двумя датами
    const diffInDays = Math.round(diffInTime / oneDay);

    const daysInYear = common.getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

    const sumin = row.i;
    const inc = row.inc;
    const dec = row.dec;
    const sumout = row.o;
    const percent = Number(row.pcnt); // процент в год
    const penalty = Number(row.plty);

    const pen = Number(penalty.toFixed(4));
    sum = sum + pen;
    
    const inputRow: any = [];

    const sumtocalc = sumin !== undefined && inc !== undefined && sumin + inc;

    inputRow.push(`${start} - ${end}`); // период
    inputRow.push(`${sumin?.toString()} + ${inc?.toString()} - ${dec?.toString()} = ${sumout?.toString()}`); // долга
    inputRow.push(`${(diffInDays + 1).toString()} * ${percent}% / ${daysInYear} * ${sumtocalc.toString()}`); // расчёт
    inputRow.push(`${pen}`); // проценты
    inputsArr.push(inputRow);
  });

  const title = caption;

  const inputsTable: common.InputsCalcTable[] = [
    {
      "title": title || "Расчёт процентов (неустойки)",
      "Calculation": inputsArr,
      "sum": `Итого: ${sum.toFixed(2).toString()}`,
      "comment": "* День уплаты денежных средств включается в период просрочки исполнения денежного обязательства.\n** Сумма процентов за период приводится до 4 знака после запятой.\n*** Общая сумма процентов приводится за 2 знака после запятой."
    }
  ];
  
  func && doGeneratePdf(common.templateCalcTable, inputsTable, ID, func, caption );
}
  /*
  const pdf_content = { content: "<h1>Welcome to html-pdf-node-ts</h1>" };
  html_to_pdf.generatePdf(pdf_content, {
    format: 'A4',
     // or A3, A2, A1, Letter, Legal, Tabloid
  }).then((pdf_buffer)=>{
    console.log(pdf_buffer);
  });
  */

  /*
  generate({ template, inputs }).then((pdf) => {
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
    console.log('PDF: ', pdf);
  });
  */

export const Calc: FC<common.CalcProps> = ({type, calcdata}) => {
  const title = type !== 1 ? 'Расчет процентов по статье 395 ГК РФ': 'Расчет договорной неустойки';
  const footer = type !==1 ? 'Расчёт процентов за пользовании чужими денежными средствами в соответствии с положениями ст.395 ГК РФ': 'Расчёт неустойки, предусмотренной соглашением между сторонами';

  let period: [number, number] = [0,0]; console.log(period);
  let decrease: Array<[number, number]> = [[0,0]]; 
  let increase: Array<[number, number]> = [[0,0]];
  
  let periodfrom: Date = new Date();
  let periodto: Date = new Date(); 

  if (calcdata) {
    period = calcdata[1];
    periodfrom = common.getDateFromNum(calcdata[1][0]);
    periodto = common.getDateFromNum(calcdata[1][1]);
    decrease = calcdata[2][0];
    increase = calcdata[2][1];
  }

  const propsdecrease = decrease.map((row, index) => {
    const result: common.DebtRow = {
      id: index,
      date: common.getDateFromNum(row[0]),
      sum: row[1]
    }
    return result;
  });

  const propsincrease = increase.map((row, index) => {
    const result: common.DebtRow = {
      id: index,
      date: common.getDateFromNum(row[0]),
      sum: row[1]
    }
    return result;
  });


  const [debt, setDebt] = useState<number>(calcdata ? calcdata[0][1]:0);
  const [currency, setCurrency] = useState(calcdata ? calcdata[0][2]:1); // 1 - RUB, 2 - USD, 3 - EUR
  const [datefrom, setDateFrom] = useState<Date|undefined>(calcdata && periodfrom);
  const [dateto, setDateTo] = useState<Date|undefined>(calcdata && periodto);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [rate, setRate] = useState(calcdata ? calcdata[0][3]:0);
  const [periodtype, setPeriodType] = useState(calcdata ? calcdata[0][4]:1); // 1 - День, 2 - Год
  const [USD, setUSD] = useState(0);
  const [EUR, setEUR] = useState(0);
  const [DebtDecrease, setDebtDecrease] = useState<common.DebtRow[]>(calcdata ? propsdecrease : debtdecrease); // Платежи в погашение долга
  const [DebtIncrease, setDebtIncrease] = useState<common.DebtRow[]>(calcdata ? propsincrease : debtincrease); // Увеличение долга
  const [Rows, setRows] = useState<common.ShortTableRow[]>(); // текущая группа
  const [sum, setSum] = useState(0);
  const [crushedData, setCrushedData] = useState<string>('');
  const [
    eventStatus, 
    setEventStatus
  ] = useState<string>(''); // Статусы события

  const [dialogQRVisible, setDialogQRVisible] = useState(false);
  const [url, setUrl] = useState<string>('');

  console.log('eventStatus: ', eventStatus);

  // Define Mini Apps event handlers to receive 
  // events from the Telegram native application.
  // defineEventHandlers();

  const LP = retrieveLaunchParams(); console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData; console.log('ID: ', ID?.user?.id);

  useEffect(() => {
    console.log('%cUSD: ','color: cyan;', USD);
    console.log('%cEUR: ','color: cyan;', EUR);
  },[USD, EUR]);

  useEffect(() => {

    common.updateCurrencyRates(setUSD, setEUR);
    
    if (datefrom && dateto) {
      const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
      //setMainTable(newMainTable);
      const newShortTable = doShortTable(newMainTable);
      //const calcB64Data = common.doCalcB64Data(datefrom, dateto, type, debt, currency, rate, periodtype, debtdecrease, debtincrease);
      //console.log(calcB64Data);
      console.log('crushedCalcB64Data: ', common.crushedCalcB64Data(datefrom, dateto, type, debt, currency, rate, periodtype, debtdecrease, debtincrease, setCrushedData));
      
      // кодирование clc + bro в ссылку
      const u = common.crushedCalcB64Data(datefrom, dateto, type, debt, currency, rate, periodtype, debtdecrease, debtincrease, setCrushedData);
      const bro = Number(ID?.user?.id);
      const b64 = common.NumToB64(bro);
      //console.log('bro64: ', b64);
      const link = common.sharelink(b64, u);
      setUrl(link);
      console.log('URL: ', ''+link);
      setRows(newShortTable);
      //const LP = retrieveLaunchParams();
      const link2 = LP?.tgWebAppData?.start_param;
      link2 && common.getCalcData(link2);

      // тест декодирования, эта функция нужна после перехода в бот по ссылке или qr-коду
      const a = common.uncrushedCalcData(u, crushedData); // удалить после тестирования
      console.log(common.fromCalcB64Data(a));
      
    }
  }, [debt, datefrom, dateto, rate, periodtype]);
  
  useEffect(() => {
    console.log('rate', rate);
    console.log('periodtype', periodtype);
  }, [rate, periodtype]);

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

  function getMaxDebtRowId( array: common.DebtRow[] ) {
    let maxId = 0;
    for (let i = 0; i < array.length; i++) if (array[i].id > maxId) maxId = array[i].id;
    return maxId;
  }

  function doShortTable(mainTable: common.MainTableRow[]) {
    
    let currentShortRow: common.ShortTableRow | null = null; // текущая строка
    let lastShortRow: common.ShortTableRow | null = null; // предыдущая строка в группе
    let lastRow: common.MainTableRow | null = null; // предыдущая строка главной таблицы
    let lastDaysInYear = 365; // количество дней в году

    let rows: common.ShortTableRow[] = [];

    mainTable.map((row, index, array) => {
      const daysInYear = common.getDayOfYear(new Date(row.date.getFullYear(), 11, 31));

      // проверка на изменение ключевых параметров
      const setNewShortRow = 
            lastRow?.in !== row.in || 
            lastRow?.out !== row.out || 
            lastRow?.percent !== row.percent ||
            lastDaysInYear !== daysInYear; // проверка на изменение дней в году

      if (setNewShortRow) {
        currentShortRow = {
          s: row.date,
          e: row.date,
          i: row.in,
          inc: row.inc,
          dec: row.dec,
          o: row.out,
          pcnt: row.percent,
          plty: row.penalty  
        } as common.ShortTableRow;
        if (lastShortRow) {
          rows.push(lastShortRow);
        } else {
          //console.log('%clastShortRow: %o', 'color: yellow', lastShortRow);
        }
      } else {
        // без изменений
        if (!currentShortRow) return;
        const penalty = row.penalty === undefined ? 0 : row.penalty;
        const sumPenalty = currentShortRow?.plty ? currentShortRow?.plty + penalty : 0 + penalty;
        currentShortRow = {
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
      } as common.ShortTableRow;

      lastShortRow = currentShortRow;
      // после проверки текущий ряд сохраняем в переменную
      lastRow = row;
      lastDaysInYear = daysInYear;
    });

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

      const daysInYear = common.getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

      const sumin = row.i;
      const inc = row.inc;
      const dec = row.dec;
      const sumout = row.o;
      const percent = Number(row.pcnt); // процент в год
      const percentPerDay = percent / daysInYear;
      console.log('percentPerDay: ', percentPerDay);
      const penalty = Number(row.plty);

      const str2 = `${start} - ${end} ${sumin?.toString().padStart(9, ' ')} + ${inc?.toString().padStart(9, ' ')} - ${dec?.toString().padStart(9, ' ')} = ${sumout?.toString().padStart(9, ' ')} ${percentPerDay?.toFixed(4).toString().padStart(3, ' ')}% ${(diffInDays + 1).toString().padStart(3, ' ')} ${penalty.toFixed(2).toString().padStart(9, ' ')}\n`;
      print = print + str2;
      sum = sum + penalty;
      if (str2.toString().length > maxLenth) maxLenth = str2.toString().length;
    });
 
    /** принт тест */
    let line = new Array(maxLenth + 1).join( '-' );
    line = line + '\n';
    
    print = '*** '+title+'\n\n' + line + print;
    print = print + line;
    console.log (print);
    console.log('Сумма: ', sum.toFixed(2));
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
    const title = type !==1 ? 'Расчёт процентов по ст.395 ГК РФ': 'Расчёт договорной неустойки';
    console.log('type: ', title);
    console.log('rate: ', rate );
    //const footer = type !==1 ? 'Расчёт процентов за пользовании чужими денежными средствами в соответствии с положениями ст.395 ГК РФ': 'Расчёт неустойки, предусмотренной соглашением между сторонами';
        
    const keyratesTable = common.doKeyRatesTable(); // ключевые ставки по дням
    console.log(keyratesTable);

    const newMainTable: common.MainTableRow[] = [];
    const n = common.getDays(from, to);
    const newArray = new Array(n).fill(null).map((_, i) => i + 1);

    const currentDate = new Date();
    const currentKey = keyratesTable.find(row => row.date === new Date().toLocaleDateString())?.key;
    const currentRate = type !==1 ? currentKey : rate;

    let debtsumin = 0;
    let increase = 0;
    let decrease = 0;
    let debtsumout = 0;
    newArray.map((item, index) => {

      const indexDate = new Date(from.getFullYear(), from.getMonth(), from.getDate() + index);

      const daysInYear = common.getDayOfYear(new Date(indexDate.getFullYear(), 11, 31));

      const inFuture = indexDate > currentDate;

      const keyRate = inFuture ?  currentKey : keyratesTable.find(row => row.date === indexDate.toLocaleDateString())?.key;

      const percent = type !== 1 ? keyRate : periodType === 1 ? currentRate && (currentRate * daysInYear): currentRate;

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

      const newRow: common.MainTableRow = {
        id: item,
        date: indexDate,
        in: debtsumin,
        inc: increase,
        dec: decrease,
        out: debtsumout,
        percent: percent,
        penalty: percent ? (( (percent/100) / daysInYear ) * ( debtsumin + increase )) : 0
      }

      debtsumin = debtsumout;
      increase = 0;
      decrease = 0;

      //console.log('newRow: ', newRow);

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

  const dateDebtTemplate = (row: common.DebtRow) => {
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

  const sumDebtDecreaseTemplate = (rowData: common.DebtRow) => {
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

  const sumDebtIncreaseTemplate = (rowData: common.DebtRow) => {
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

  const calcRowTemplate = (Row: common.ShortTableRow, index: number) => {
    // В расчёте необходима проверка для перехода года на следующий год
    // При создании maintable надо проверять год на високосный год
    //console.log('Row: ', Row);
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
                  <div className='inline-block h-rem text-left'>
                    {
                      Math.round((Row.e.getTime() - Row.s.getTime()) / (1000 * 60 * 60 * 24))+1
                    }
                  </div>
                  <div className="inline-block w-rem h-rem text-left mx-1">*</div>
                  <div className="inline-block">
                    {
                      periodtype === 2 ? 
                        Row.pcnt?.toFixed(2) + ' % / ' + common.getDayOfYear(new Date(Row.e.getFullYear(), 11, 31)):
                        Row.pcnt !== undefined && (Row.pcnt / common.getDayOfYear(new Date(Row.e.getFullYear(), 11, 31))).toFixed(4) + ' %'
                    }
                  </div>
                  <div className="inline-block w-rem h-rem text-left mx-1">*</div>
                  <div className="inline-block">
                    {
                      Row.inc === 0 ? Row.i?.toLocaleString() : Row.o?.toLocaleString()
                    }
                  </div>
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
                  <div className="inline-block font-bold app theme-accent-text-color">
                    {
                      periodtype === 2 ?
                        Row.plty && Row.plty.toLocaleString():
                        Row.plty && Number(Row.plty.toFixed(2)).toLocaleString()
                    }
                    </div>
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    );
  };

  const calcResultTemplate = (Rows: common.ShortTableRow[]) => {
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
              <div
                className="inline-block h-rem text-left app theme-accent-text-color"
              >
                Сумма процентов: {sum && parseFloat(sum.toFixed(2)).toLocaleString()} {common.currencies.filter(c => c.value === currency)[0]?.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function QRCode_Styling({text}: {text: string}) {
    const LP = retrieveLaunchParams();
    const tgWebAppData = LP?.tgWebAppData;
    const ID = tgWebAppData;
    
    const cardFront = 'Чёрное на белом';
    const cardBack = 'Белое на чёрном';
    const [isFlipped, setFlipped] = useState(false);

    const refCanvas = useRef<HTMLCanvasElement>(null);
    const refCanvasBW = useRef<HTMLCanvasElement>(null);

    const handleFlip = () => {
      setFlipped(!isFlipped);
    };

    const qrCodeWB = new QRCodeStyling({
      data: text,
      //image: "https://casebookkiller.github.io/poshlina-dev/Logo.svg",
      shape: 'square',
      dotsOptions: {
        color: 'white',
        type: 'random-dot',
        size: 18,
      },
      cornersSquareOptions: {
        color: 'white',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: 'white',
        type: 'extra-rounded'
      },
      backgroundOptions: {
        color: 'black',//'rgba(0,0,0,0)',//backgroundColor,
        margin: 1
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 1,
        imageSize: 0.5
      }
    });

    const qrCodeBW = new QRCodeStyling({
      data: text,
      //image: "https://casebookkiller.github.io/poshlina-dev/Logo.svg",
      shape: "square",
      dotsOptions: {
        color: 'black',
        type: "random-dot",
        size: 18,
      },
      cornersSquareOptions: {
        color: 'black',
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: 'black',
        type: "extra-rounded"
      },
      backgroundOptions: {
        color: 'white',
        margin: 1
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 1,
        imageSize: 0.5
      }
    });

    useEffect(() => {
      console.log('%cQRCode: %o', `color: ${common.colors.text}`, qrCodeWB);
      console.log('%cQRCodeBW: %o', `color: ${common.colors.text}`, qrCodeBW);
      
      function getSize(qrCode: QRCodeStyling) {
        return {width: qrCode.size?.width, height: qrCode.size?.height};
      }

      const size = getSize(qrCodeWB);
      console.log(size);

      const sizebw = getSize(qrCodeBW);
      console.log(sizebw);
      
      // белое на чёрном 
      qrCodeWB.serialize().then((code) => {
        if (code !== undefined) {
          let dataURL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(code);
          
          let canvas: HTMLCanvasElement = document.getElementById('canvaswb') as HTMLCanvasElement;
          
          canvas.width = size.width || 0;
          canvas.height = size.height || 0;
          
          let ctx:any;
          if (canvas?.getContext) {
            ctx = canvas.getContext('2d');
          } else {
            console.error('Canvas element not found');
          }

          let _img = new Image();
          _img.width = 1024;
          _img.height = 1024;
          
          _img.addEventListener('load', e => {
            ctx.drawImage(e.target, 0, 0);

            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                console.log(url);
              }
            })
          });

          _img.src = dataURL;
        }
      });

      //qrCodeWB.append(document.getElementById('canvaswb') as HTMLCanvasElement);
      // черное на белом
      qrCodeBW.serialize().then((code) => {
        if (code !== undefined) {
          let dataURL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(code);
          let canvasbw: HTMLCanvasElement = document.getElementById('canvasbw') as HTMLCanvasElement;
          
          canvasbw.width = size.width || 0;
          canvasbw.height = size.height || 0;
          
          let ctx:any;
          if (canvasbw?.getContext) {
            ctx = canvasbw.getContext('2d');
          } else {
            console.error('Canvas element not found');
          }

          let _img = new Image();
          _img.width = 1024;
          _img.height = 1024; 

          _img.addEventListener('load', e => {
            ctx.drawImage(e.target, 0, 0);

            canvasbw.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                console.log(url);
              }
            })
          });

          _img.src = dataURL;
        }
      });
    }, []);
    
    return (
      <React.Fragment>
        <PrimeReactProvider value={{unstyled: false}}>
          <div className="App" style={{
            display: 'flex',
            justifyContent: 'center',
            minHeight:'370px',
            width:'auto',
            overflowY: 'hidden',
          }}>
            <div className="QRFlip">
              <h4 style={{color: common.colors.accent, margin: '0px 0px 10px 0px'}}>Нажми для изменения цвета</h4>
              <div className="container">
                <div
                  className={`flip-card ${
                    isFlipped ? "flipped" : ""
                  }`}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <div
                        className="card-content"
                        onClick={handleFlip}
                      >
                        {cardFront}
                        <div className='placeholder'>
                          <canvas ref={refCanvasBW} className="square" id='canvasbw' style={{
                            display:'block',
                            padding: 0,
                            maxWidth: '234px',
                            maxHeight: '234px',
                          }}/>
                        </div>
                      </div>
                    </div>

                    <div className='flip-card-back'>
                      <div
                        className='card-content'
                        onClick={handleFlip}
                      >
                        {cardBack}
                        <div className='placeholder'>
                          <canvas
                            ref={refCanvas}
                            className='square'
                            id='canvaswb'
                            style={{
                              display:'block',
                              padding: 0,
                              maxWidth: '234px',
                              maxHeight: '234px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex mt-1'>  
                  <PrimeReactFlex>
                    <Button
                      id='btnSendToChat'
                      style={{ 
                        width: '100%',
                        minWidth: '145px',
                        height: '34px',
                        fontSize: '12px'
                      }}
                      onClick={() => {
                        let canvas: HTMLCanvasElement;
                        if (isFlipped) {
                          canvas = document.getElementById('canvaswb') as HTMLCanvasElement;
                        } else {
                          canvas = document.getElementById('canvasbw') as HTMLCanvasElement;
                        }
                        
                        canvas.toBlob((blob) => {
                          //////
                          // сюда перенести логику с соохранением ссылка на расчёт
                          //////
                          if (blob) {
                            
                            //const sou = courtType === 'obsh' ? human(sum) : '';
                            //const arb = courtType === 'arb' ? human(sum) : '';
                            //const url = sharelink(sou, arb, benefitsSwitch, discount30Switch, discount50Switch, userid); 
                            
                            //const url = 'https://casebookkiller.github.io/';
                            console.log('url: ', url);
                            
                            //const caption = posh ? `<b>При обращении в ${courtType === 'obsh' ? 'суд общей юрисдикции' : 'арбитражный суд'}</b>\n\nс ценой иска: <b>${human(sum)} руб.</b>\n\nРазмер пошлины составляет:\n\n<b>${human(posh)} руб.</b>\n\n<a href='${url}'>Открыть расчёт</a>`: '';
                            const caption = 'расчёт';

                            let formData = new FormData();
                            formData.append('chat_id', ID?.user?.id.toString() || '');
                            formData.append('parse_mode', 'html');
                            formData.append('caption', caption);
                            //formData.append('caption_entities', JSON.stringify([]));
                            formData.append('photo', blob, 'qr.png');
                            botMethod(
                              'sendPhoto',
                              formData
                            ).then((result) => {
                              console.log(result);
                              setDialogQRVisible(false);
                              //setPopupQRVisible(false);
                              if (openTelegramLink.isAvailable()) {
                                openTelegramLink('https://t.me/'+import.meta.env.VITE_BOT_NAME);
                              }
                            }).catch((error) => {
                              console.log(error);
                            })
                            //downloadBlob(blob);
                            //copyToClipboard(data);
                          }
                        });

                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        {/*<ChatLeftDots/>*/}
                        <span style={{marginLeft:'5px', fontWeight: 'normal'}}>Сохранить в чат</span>
                      </div>
                    </Button>
                    <Button
                      label="Закрыть"
                      onClick={() => setDialogQRVisible(false)}
                      autoFocus
                      className='ml-2'
                      style={{ width: '80%', height: '34px', fontSize: '12px'}}
                    />
                    {/*
                    <Button
                      style={{
                        height: '34px',
                        fontSize: '12px',
                        backgroundColor: backgroundColor,
                        color: hintColor,
                        alignItems: 'center',
                        borderColor: hintColor
                      }}
                      onClick={() => {
                        setPopupQRVisible(false);
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        <BoxArrowRight/>
                        <span style={{marginLeft:'5px', fontWeight: 'normal'}}>Закрыть</span>
                      </div>
                    </Button>
                    */}
                  </PrimeReactFlex>
                  </div>
              </div>
            </div>
          </div>
        </PrimeReactProvider>
      </React.Fragment>
    );
  }

  const MockContentWithQRCode = () => {
    return (
      <>
        <div style={{ padding: '40px 20px 10px' }}>
          <QRCode_Styling text={url}/>
        </div>
      </>
      )
  }
  const headerQRModal = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <span className="font-bold white-space-nowrap">QR-код с расчётом</span>
    </div>
  );

  /*const footerQRModal = (
    <div>
      <Button label="Закрыть" icon="pi pi-check" onClick={() => setDialogQRVisible(false)} autoFocus />
    </div>
  );*/

  return (
    <div className='calc'>
      <PrimeReactProvider>
      <Panel
        header={title || 'Заголовок'}
        footer={footer || 'Подвал'}
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
                options={common.currencies}
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
                    setNumberOfDays(common.getDays(e.value, dateto));
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
                    setNumberOfDays(common.getDays(datefrom, e.value));
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
        {/*<AppSection
          header={'Заголовок 1'}
          subheader={'Подзаголовок 1'}
          body={'Текст 1'}
          subheaderNoWrap
          borderBottom
        />*/}
        {/* --раздел-- */}
        <AppSection
          header={'Сохранение расчёта'}
          subheader={<div className='app wrap justify-content-between flex'>Вы можете отправить расчёт в формате PDF другому пользователю или сохранить его в чате с ботом приложения.</div>}
          body={
            <div style={{width: '100%'}} className='flex'>
              <Dialog
                visible={dialogQRVisible}
                modal
                //maximizable={true}
                //maximized={true}
                header={headerQRModal}
                //footer={footerQRModal}
                style={{ width: '50rem' }}
                onHide={() => {if (!dialogQRVisible) return; setDialogQRVisible(false); }}
              >
                <MockContentWithQRCode />
              </Dialog>
              <Button
                className='btntest mt-2 flex-initial flex align-items-center justify-content-center'
                icon="pi pi-qrcode"
                disabled={!datefrom || !dateto}
                onClick={
                  () => {
                    if (datefrom && dateto) {
                      setDialogQRVisible(true);
                    }
                  }
                }
              />
              <Button
                className='btntest ml-1 mt-2 flex-initial flex align-items-center justify-content-center'
                icon="pi pi-share-alt"
                disabled={!datefrom || !dateto}
                onClick={
                  () => {
                    // необходимо получить id документа и передать его в sendPDF
                    if (datefrom && dateto) {
                      const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
                      //sendPDF(newMainTable, ID, setEventStatus);
                      doWithCalculation(newMainTable, ID, sendPreparedBlob, setEventStatus, title)
                    }
                  }
                }
              >
                {/*Поделиться расчётом*/}
              </Button>
              {/*<span>{ eventStatus }</span>*/}
                <Button
                  className='btntest ml-1 mt-2 flex-initial flex align-items-center justify-content-center'
                  icon="pi pi-save"
                  iconPos='right'
                  disabled={!datefrom || !dateto}
                  onClick={
                    () => {
                      if (datefrom && dateto) {
                        const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
                        //doPDF(newMainTable, ID);
                        // new version
                        doWithCalculation(newMainTable, ID, sendDocumentBlob, setEventStatus, title );
                      }
                    }
                  }
                >
                  {/*Отправить расчёт в чат с ботом*/}
                </Button>              
            </div>
          }
          subheaderNoWrap
          borderBottom
        />
        {/* --раздел-- */}
        {/*
        <AppSection
          header={'Заголовок 3'}
          subheader={'Подзаголовок 3'}
          body={
            <div style={{width: '100%'}} className='flex justify-content-start'>
                <Button
                  className='btntest mt-2 flex-initial flex align-items-center justify-content-center'
                  icon="pi pi-send"
                  iconPos='right'
                  disabled={!datefrom || !dateto}
                  onClick={
                    () => {
                      if (datefrom && dateto) {
                        const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
                        //doPDF(newMainTable, ID);
                        // new version
                        doWithCalculation(newMainTable, ID, sendDocumentBlob );
                      }
                    }
                  }
                >
                  Отправить расчёт в чат с ботом
                </Button>
            </div>
          }
          subheaderNoWrap
          
        />*/}
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
    sendDocument
    Используйте этот метод для отправки обычных файлов. В случае успеха отправленное сообщение будет возвращено. В настоящее время боты могут отправлять файлы любого типа размером до 50 МБ, но в будущем это ограничение может быть изменено.

    Параметр                        Тип                       Обязательный  Описание
    --------------------------------------------------------------------------------
    business_connection_id	        String	                  По выбору     Уникальный идентификатор бизнес-подключения, от имени которого будет отправлено сообщение
    chat_id                         Integer или String	      Да	          Уникальный идентификатор целевого чата или имя пользователя целевого канала (в формате @channelusername)
    message_thread_id	              Integer	                  По выбору     Уникальный идентификатор целевой ветки (темы) форума; только для супергрупп форума
    document	                      InputFile или String      Да	          Файл для отправки. Передайте file_id в виде строки, чтобы отправить файл, который существует на серверах Telegram (рекомендуется), передайте URL-адрес HTTP в виде строки, чтобы Telegram получил файл из Интернета, или загрузите новый файл с помощью multipart/form-data. Подробнее об отправке файлов »
    thumbnail	                      InputFile или String	    По выбору     Эскиз отправленного файла; можно игнорировать, если создание эскиза для файла поддерживается на стороне сервера. Эскиз должен быть в формате JPEG и иметь размер менее 200 КБ. Ширина и высота эскиза не должны превышать 320. Игнорируется, если файл не загружается с помощью multipart/form-data. Эскизы нельзя использовать повторно, их можно загружать только как новый файл, поэтому вы можете передать «attach://<имя_файла_приложения>», если эскиз был загружен с помощью multipart/form-data под <именем_файла_приложения>. Подробнее об отправке файлов »
    caption	                        String	                  По выбору     Заголовок документа (также может использоваться при повторной отправке документов по идентификатору файла), 0-1024 символа после разбора сущностей
    parse_mode	                    String	                  По выбору     Режим для анализа сущностей в заголовке документа. Подробнее см. в параметрах форматирования.
    caption_entities	              Array of MessageEntity	  По выбору     Сериализованный в формате JSON список специальных сущностей, которые появляются в заголовке и которые можно указать вместо parse_mode
    disable_content_type_detection	Boolean	                  По выбору     Отключает автоматическое определение типа контента на стороне сервера для файлов, загруженных с помощью multipart/form-data
    disable_notification	          Boolean	                  По выбору     Отправляет сообщение без звука. Пользователи получат уведомление без звука.
    protect_content	                Boolean	                  По выбору     Защищает содержимое отправленного сообщения от пересылки и сохранения
    allow_paid_broadcast	          Boolean	                  По выбору     Установите значение True, чтобы разрешать отправку до 1000 сообщений в секунду, игнорируя ограничения на трансляцию, за плату в 0,1 звезды Telegram за сообщение. Соответствующие звезды будут списаны с баланса бота
    message_effect_id	              String	                  По выбору     Уникальный идентификатор эффекта сообщения, который будет добавлен к сообщению; только для личных чатов
    reply_parameters	              ReplyParameters	          По выбору     Описание сообщения, на которое нужно ответить
    reply_markup	                  InlineKeyboardMarkup или 
                                    ReplyKeyboardMarkup или 
                                    ReplyKeyboardRemove или 
                                    ForceReply	              По выбору     Дополнительные параметры интерфейса. Сериализованный в формате JSON объект для встроенной клавиатуры, пользовательской клавиатуры для ответов, инструкций по удалению клавиатуры для ответов или по принудительному ответу пользователя
  ------------------------------------------------------------------------------
 
  Отправка файлов
  -------------
  Есть три способа отправить файлы (фотографии, стикеры, аудио, мультимедиа и т. д.):

  Если файл уже сохранён где-то на серверах Telegram, вам не нужно загружать его повторно: у каждого объекта файла есть поле file_id, просто передайте этот file_id в качестве параметра вместо загрузки. Ограничений на отправку файлов таким способом нет.
  Укажите Telegram URL-адрес HTTP для отправки файла. Telegram загрузит и отправит файл. Максимальный размер фотографий — 5 МБ, других типов контента — 20 МБ.
  Отправьте файл с помощью multipart/form-data обычным способом, как при загрузке файлов через браузер. Максимальный размер фотографий — 10 МБ, других файлов — 50 МБ.
  Отправка по идентификатору файла

  При повторной отправке по идентификатору файла невозможно изменить тип файла. То есть видео нельзя отправить как фотографию, фотографию нельзя отправить как документ и т. д.
  Повторная отправка миниатюр невозможна.
  При повторной отправке фотографии по идентификатору файла будут отправлены все её размеры.
  Идентификатор файла уникален для каждого отдельного бота и не может быть передан от одного бота другому.
  file_id однозначно идентифицирует файл, но у одного и того же файла могут быть разные допустимые file_id даже для одного и того же бота.
  Отправка по URL

  При отправке по URL целевой файл должен иметь правильный тип MIME (например, audio/mpeg для sendAudio и т. д.).
  В sendDocument отправка по URL в настоящее время работает только для файлов .PDF и .ZIP.
  Чтобы использовать функцию sendVoice, файл должен быть в формате audio/ogg и иметь размер не более 1 МБ. Голосовые заметки размером от 1 до 20 МБ будут отправляться в виде файлов.
  Другие конфигурации могут работать, но мы не можем гарантировать это.
  */


/*
savePreparedInlineMessage
------------------------------------
Сохраняет сообщение, которое может быть отправлено пользователем мини-приложения. Возвращает объект PreparedInlineMessage.

Параметр	              Тип	                Обязательный	    Описание
--------------------------------------------------------------------------------------
user_id	                Integer	            Да	              Уникальный идентификатор целевого пользователя, который может использовать подготовленное сообщение
result	                InlineQueryResult	  Да 	              Объект в формате JSON, описывающий отправляемое сообщение
allow_user_chats	      Boolean	            По выбору	        Передайте значение True, если сообщение можно отправить в личные чаты с пользователями
allow_bot_chats	        Boolean	            По выбору	        Передайте значение True, если сообщение можно отправить в личные чаты с ботами
allow_group_chats	      Boolean	            По выбору	        Передайте значение True, если сообщение можно отправить в групповые и супергрупповые чаты
allow_channel_chats	    Boolean	            По выбору	        Передайте значение True, если сообщение можно отправить в групповые чаты

PreparedInlineMessage
------------------------------------
Описывает встроенное сообщение, которое может быть отправлено пользователем мини-приложения.

Поле	                  Тип	                                  Описание
--------------------------------------------------------------------------------------
id	                    String	                              Уникальный идентификатор подготовленного сообщения
expiration_date	        Integer	                              Дата истечения срока действия подготовленного сообщения по времени Unix. Подготовленные сообщения с истекшим сроком действия больше нельзя использовать

InlineQueryResult
------------------------------------
Этот объект представляет собой один результат встроенного запроса. В настоящее время клиенты Telegram поддерживают результаты следующих 20 типов:

InlineQueryResultCachedAudio
InlineQueryResultCachedDocument
InlineQueryResultCachedGif
InlineQueryResultCachedMpeg4Gif
InlineQueryResultCachedPhoto
InlineQueryResultCachedSticker
InlineQueryResultCachedVideo
InlineQueryResultCachedVoice
InlineQueryResultArticle
InlineQueryResultAudio
InlineQueryResultContact
InlineQueryResultGame
InlineQueryResultDocument
InlineQueryResultGif
InlineQueryResultLocation
InlineQueryResultMpeg4Gif
InlineQueryResultPhoto
InlineQueryResultVenue
InlineQueryResultVideo
InlineQueryResultVoice
*/

/*
InlineQueryResultDocument
------------------------------------
Представляет собой ссылку на файл. По умолчанию этот файл будет отправлен пользователем с дополнительной подписью. В качестве альтернативы вы можете использовать input_message_content, чтобы отправить сообщение с указанным содержимым вместо файла. В настоящее время с помощью этого метода можно отправлять только файлы .PDF и .ZIP.

Поле	                  Тип	                                  Описание
--------------------------------------------------------------------------------------
type	                  String	                              Тип результата встроенного запроса, должен быть указан document
id	                    String	                              Уникальный идентификатор этого результата, 1-64 байта
title	                  String	                              Название для результата встроенного запроса
caption	                String	                              По выбору. Заголовок отправляемого документа, 0-1024 символа после разбора сущностей
parse_mode	            String	                              По выбору. Режим для анализа сущностей в заголовке документа. Подробнее см. в параметрах форматирования.
caption_entities	      Array of MessageEntity	              По выбору. Список специальных сущностей, которые появляются в заголовке и которые можно указать вместо parse_mode
document_url	          String	                              Допустимый URL-адрес для файла
mime_type	              String	                              MIME-тип содержимого файла: «application/pdf» или «application/zip»
description	            String	                              По выбору. Краткое описание результата
reply_markup	          InlineKeyboardMarkup	                По выбору. Встроенная клавиатура, прикрепленная к сообщению
input_message_content	  InputMessageContent	                  По выбору. Содержимое отправляемого сообщения вместо файла
thumbnail_url	          String	                              По выбору. URL-адрес миниатюры (только в формате JPEG) для файла
thumbnail_width	        Integer	                              По выбору. Ширина миниатюры
thumbnail_height	      Integer	                              По выбору. Высота миниатюры
*/

/*
const doc = {
  type: 'document',                                           // тип результата встроенного запроса
  id: 1,                                                      // уникальный идентификатор этого результата
  title: 'Документ 1',                                        // название для результата встроенного запроса
  caption: 'Подпись документа 1',                             // заголовок отправляемого документа
  //parse_mode: 'HTML',                                       // режим для анализа сущностей в заголовке
  //caption_entities: [],                                     // список специальных сущностей
  document_url: URL.createObjectURL(blob),                    // URL-адрес для файла
  mime_type: 'application/pdf',                               // MIME-тип содержимого файла
  description: 'Описание документа 1',                        // краткое описание результата
  //reply_markup: {},                                         // встроенная клавиатура
  //input_message_content: {},                                // содержимое отправляемого сообщения
  //thumbnail_url: '',                                        // URL-адрес миниатюры
  //thumbnail_width: 0,                                       // ширина миниатюры
  //thumbnail_height: 0                                       // высота миниатюры
};
*/

/*
InlineQueryResultCachedDocument
------------------------------------
Представляет собой ссылку на файл, хранящийся на серверах Telegram. По умолчанию этот файл будет отправлен пользователем с дополнительной подписью. В качестве альтернативы вы можете использовать input_message_content для отправки сообщения с указанным содержимым вместо файла.

Поле	                  Тип	                                  Описание
--------------------------------------------------------------------------------------
type	                  String	                              Тип результата встроенного запроса, должен быть указан document
id	                    String	                              Уникальный идентификатор этого результата, 1-64 байта
title	                  String	                              Название для результата встроенного запроса
document_file_id	      String	                              Действительный идентификатор для этого файла
description	            String	                              По выбору. Краткое описание результата
caption	                String	                              По выбору. Заголовок отправляемого документа, 0-1024 символа после разбора сущностей
parse_mode	            String	                              По выбору. Режим для анализа сущностей в заголовке документа. Подробнее см. в параметрах форматирования.
caption_entities	      Array of MessageEntity	              По выбору. Список специальных сущностей, которые появляются в заголовке и которые можно указать вместо parse_mode
reply_markup	          InlineKeyboardMarkup	                По выбору. Встроенная клавиатура, прикрепленная к сообщению
input_message_content	  InputMessageContent	                  По выбору. Содержимое отправляемого сообщения вместо файла
*/





/*
*** Расчёт процентов по ст.395 ГК РФ
период / задолженность / расчёт процентов(неустойки) / сумма процентов(неустойки)
--------------------------------------------------------------------------------------------
01.02.2025 - 10.02.2025    100000 +         0 -         0 =    100000 0.0575%  10    575.34
11.02.2025 - 11.02.2025    100000 +         0 -      1000 =     99000 0.0575%   1     57.53
12.02.2025 - 12.02.2025     99000 +      3000 -         0 =    102000 0.0575%   1     58.68
13.02.2025 - 10.03.2025    102000 +         0 -         0 =    102000 0.0575%  26   1525.81
11.03.2025 - 11.03.2025    102000 +         0 -      2000 =    100000 0.0575%   1     58.68
12.03.2025 - 12.03.2025    100000 +      2000 -         0 =    102000 0.0575%   1     58.68
13.03.2025 - 10.04.2025    102000 +         0 -         0 =    102000 0.0575%  29   1701.86
11.04.2025 - 11.04.2025    102000 +         0 -      3000 =     99000 0.0575%   1     58.68
12.04.2025 - 12.04.2025     99000 +      1000 -         0 =    100000 0.0575%   1     57.53
13.04.2025 - 30.04.2025    100000 +         0 -         0 =    100000 0.0575%  18   1035.62
--------------------------------------------------------------------------------------------
*/


  /*
  const msg = {
    type: 'article',
    id: 1,
    title: 'Заголовок 1',
    description: 'Описание 1',
    caption: 'Подпись 1',
    input_message_content: {
      'message_text': 'А это текст сообщения 1'
    }
  };
  const doc = {
    type: 'document',
    id: 1,
    title: 'Документ 1',
    description: 'Описание документа 1',
    caption: 'Подпись документа 1',
    document_url: 'https://google.com',
    mime_type: 'application/pdf'
  }
  
  console.log('test');
  
  //interface FormData {
  //  yoo: typeof FormData.prototype.append;
  //}
  
  //FormData.prototype.yoo = FormData.prototype.append;

  const FD = new FormData();
  
  //FormData.prototype.add = FormData.prototype.append;
  //console.log('id: ', ID?.user?.id);
  FD.append('user_id', ID?.user?.id.toString() || '');
  FD.append('result', JSON.stringify(msg));
  FD.append('allow_user_chats', 'true');
  FD.append('allow_bot_chats', 'true');
  FD.append('allow_group_chats', 'true');
  FD.append('allow_channel_chats', 'true');
  // web_app_send_prepared_message
  botMethod(
    'savePreparedInlineMessage',
    FD
  ).then((result: any) => {

    window.addEventListener('message', ({ data }) => {
      //const { eventType, eventData } = JSON.parse(data);
      console.log(data);
    });

    console.log(result);
    //console.log(result.payload?.result?.status);
    const PIM: PreparedInlineMessage = result.payload?.result;
    console.log(PIM.id);
    //const D = new FormData();
    //D.append('inline_message_id', PIM.id.toString());
    
    //console.log(`window: `, window);
    //botMethod('SentWebAppMessage', D);
    postEvent('web_app_send_prepared_message', {id: PIM.id.toString()});
    on('prepared_message_sent', (data) => { console.log(data); setEventStatus(String(data)); });
    on('prepared_message_failed', (data) => { console.log(data); setEventStatus(String(data)); });
                
  }).catch((error) => {
    console.log(error);
  });
  */

  /*
  //your bot token placed here
  const token = "";
  tgmsg('answerInlineQuery', {

      "inline_query_id": update['inline_query']['id'],
      "results": JSON.stringify([
          //inline result of an article with thumbnail photo
          {
              "type": "article",
              "id": "1",
              "title": "chek inline keybord ",
              "description": "test ",
              "caption": "caption",
              "input_message_content": {
                  "message_text": "you can share inline keyboard to other chat"
              },

              "thumb_url": "https://avatars2.githubusercontent.com/u/10547598?v=3&s=88"
          },
          //inline result of an article with inline keyboard
          {
              id: "nchfjdfgd",
              title: 'title',
              description: "description",
              type: 'article',
              input_message_content: {
                  message_text: "inline is enabled input_message_content: {message_text: message_text}message_text"
              },
              reply_markup: {
                  "inline_keyboard": [
                      [{
                          "text": "InlineFeatures.",
                          "callback_data": "inline_plugs_1118095942"
                      }],
                      [{
                          "text": "OtherFeatures.",
                          "callback_data": "other_plugs_1118095942"
                      }]
                  ]
              }
          },

          //inline result of a cached telegram document with inline keyboard
          {
              id: "nchgffjdfgd",
              title: 'title',
              description: "description",
              //change this on with the value of file_id from telegram bot api 
              document_file_id: "BQACAgQAAxkBAAIBX2CPrD3yFC0X1sI0HFTxgul0GdqhAALjDwACR4pxUKIV48XlktQNHwQ",
              type: 'document',
              caption: "caption ghh hhdd",
              reply_markup: {
                  "inline_keyboard": [
                      [{
                          "text": "InlineFeatures.",
                          "callback_data": "inline_plugs_1118095942"
                      }],
                      [{
                          "text": "OtherFeatures.",
                          "callback_data": "other_plugs_1118095942"
                      }]
                  ]
              }

          }
      ])
  })

  function tgmsg(method, data) {
      var options = {
          'method': 'post',
          'contentType': 'application/json',
          'payload': JSON.stringify(data)
      };
      var responselk = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/' + method, options);
  }
  */
