//https://pdfme.com/docs/getting-started

import * as RU from '../../locale/ru.json';
import * as jsoncrush from 'jsoncrush';

import { dateFromString, getDayOfYear, getDays, doKeyRatesTable, templateCalcTable, InputsCalcTable, CalcProps, DebtRow, ShortTableRow, MainTableRow, getCurrencies } from './common';

import { FC, useEffect, useState } from 'react';

//text, barcodes, image,
import { Template } from '@pdfme/common';
import { text, table } from '@pdfme/schemas';
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

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { botMethod, PreparedInlineMessage } from '@/api/bot/methods';

import './Calc.css';

//import { segodnya } from './functions';
addLocale('ru', RU.ru);
locale('ru');

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

const currencies = [
  { name: '₽', value: 1, text: 'Российский рубль', eng: 'RUB', rus: 'руб.' },
  { name: '$', value: 2, text: 'Доллар США', eng: 'USD', rus: 'долл.' },
  { name: '€', value: 3, text: 'Евро', eng: 'EUR', rus: 'евро' },
];

// Вспомогательная функция для создания файла с расчётом
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

// Интерфейс параметров для функции обратного вызова для обработки blob PDF
interface IParamsDoWithPDF {
  sendAdmin?: boolean;            // Признак отправки админу
  cb?: (result: any) => void;     // Обработка результата обратного вызова
  caption?: string;               // Заголовок
}

// Интерфейс функции обратного вызова для обработки blob PDF
interface IDoWithPDF {
  (
    blob: Blob,                       // Blob PDF
    InitialData: any,                 // Данные инициализации приложения
    params?: IParamsDoWithPDF         // Параметры
  ) : void 
}

function doGeneratePdf(
  template: Template,                 // Шаблон
  inputs: InputsCalcTable[],          // Входные данные
  InitialData: any,                   // Данные инициализации приложения
  cb: IDoWithPDF,                     // Функция обратного вызова
  caption?: string                    // Заголовок
) {
  generate({
    template: template,
    inputs: inputs,
    plugins: { Text: text, Table: table },
  }).then((pdf) => {
    // Блоб файла PDF с расчётом
    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    
    function logresult(result: any) {
      // функция для отслеживания результата обратного вызова  
      console.log('Обработка результата: ', result)
    }
    const ID = InitialData || '';
    // Отправляем PDF в функцию-обработчик
    // передача blob PDF в функцию обратного вызова
    const params: IParamsDoWithPDF = {
      sendAdmin: false,                             // Признак отправки админу
      cb: logresult,                                // обработка результата обратного вызова
      caption: caption || 'Документ с расчётом'     // заголовок документа
    };
    cb(blob, ID, params); 
    // console.log('PDF: ', pdf);
  });
}

// Удаление сообщений в чате
function deleteMessage(
  chat_id: number,
  message_id: number
) {
  /*
  deleteMessage
  ---------------------------------------------------------------------------------------------
  Используйте этот метод для удаления сообщений, в том числе служебных, со следующими ограничениями:
  - Сообщение может быть удалено, только если оно было отправлено менее 48 часов назад.
  - Служебные сообщения о создании супергруппы, канала или темы на форуме удалить невозможно.
  - Сообщение dice в приватном чате можно удалить, только если оно было отправлено более 24 часов назад.
  - Боты могут удалять исходящие сообщения в приватных чатах, группах и супергруппах.
  - Боты могут удалять входящие сообщения в личных чатах.
  - Боты с разрешением can_post_messages могут удалять исходящие сообщения в каналах.
  - Если бот является администратором группы, он может удалить любое сообщение в ней.
  - Если у бота есть разрешение can_delete_messages в супергруппе или канале, он может удалить любое сообщение в них.
  При успешном выполнении возвращает True.

  Параметр    Тип                 Обязательный  Описание
  ---------------------------------------------------------------------------------------------
  chat_id     Integer или String  Да            Уникальный идентификатор целевого чата или имя пользователя целевого канала (в формате @channelusername)
  message_id  Integer             Да            Идентификатор сообщения, которое требуется удалить.
  */
  const FD = new FormData();
  FD.append('chat_id', chat_id.toString());
  FD.append('message_id', message_id.toString());
  
  botMethod(
    'deleteMessage',
    FD
  ).then((result: any) => {
    console.log(result);
  }).catch((error)=>{
    console.log(error);
  });
}

/*** --- оптимизировать совместно с sendPreparedBlob */
function sendDocumentBlob(
  blob: Blob,
  InitialData: any,
  params?: IParamsDoWithPDF
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
  */
  
  //FD.append('business_connection_id', business_connection_id);
  FD.append('chat_id', chat_id);                                                    // обязательный параметр, идентификатор целевого чата, в который будет отправлен файл
  //FD.append('message_thread_id', message_thread_id);                              // необязательный параметр, идентификатор целевой ветки (темы) форума, в который будет отправлен файл
  FD.append('document', blob, 'calculation.pdf');                                   // обязательный параметр, файл для отправки
  //FD.append('thumbnail', thumbnail, 'calculation.png');                           // необязательный параметр, эскиз отправленного файла
  FD.append('caption', params && params?.caption || '');                            // необязательный параметр, заголовок документа 
  //FD.append('parse_mode', parse_mode);                                            // необязательный параметр, режим для анализа сущностей в заголовке документа
  //FD.append('caption_entities', caption_entities);                                // необязательный параметр, список специальных сущностей
  //FD.append('disable_content_type_detection', disable_content_type_detection);    // необязательный параметр
  //FD.append('disable_notification', disable_notification);                        // необязательный параметр
  //FD.append('protect_content', protect_content);                                  // необязательный параметр
  //FD.append('allow_paid_broadcast', pallow_paid_broadcast);                       // необязательный параметр
  //FD.append('message_effect_id', message_effect_id);                              // необязательный параметр
  //FD.append('reply_parameters', reply_parameters);                                // необязательный параметр
  
  //////////////////////////
  // при вызове только savePreparedInlineMessage расчёт отправлять админу, с последующим удалением сообщения кэшированного файла
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
  params?: IParamsDoWithPDF
) {
  // Выполнить все Этапы
  // 1. Создание документа
  // 2. Получение документа в формате Blob
  // 3. Отправка документа админу
  // 4. Получение id отправленного документа
  // 5. Создание InlineQueryResultCachedDocument
  // 6, savePreparedInlineMessage
  const ID = InitialData || '';
  console.log(blob);
  // обрабатываем Blob PDF

  /*window.open(URL.createObjectURL(blob));

  const FD = new FormData();
  FD.append('chat_id', ID?.user?.id.toString() || '');
  FD.append('document', blob, 'calc.pdf');
  botMethod(
    'sendDocument',
    FD
  ).then((result) => {
    console.log(result);
    if (openTelegramLink.isAvailable()) {
      openTelegramLink('https://t.me/'+import.meta.env.VITE_BOT_NAME);
    }
  }).catch((error)=>{
    console.log(error);
  });
  */
  
  const msg = {
    type: 'article',
    id: 1,
    title: 'Заголовок 1',
    description: 'Описание 1',
    caption: params?.caption || '',
    input_message_content: {
      'message_text': 'А это текст сообщения 1'
    }
  };

  ////////////////////////////////////////
  ////////////////////////////////////////
  // ПОРА РЕАЛИЗОВАТЬ ОТПРАВКУ PDF
  ////////////////////////////////////////
  ////////////////////////////////////////
  
  /*
  const doc = {
    type: 'document',
    id: 1,
    title: 'Документ 1',
    description: 'Описание документа 1',
    caption: 'Подпись документа 1',
    document_url: URL.createObjectURL(blob),
    mime_type: 'application/pdf'
  }
  */
  
  /*
  Field	                  Type	                  Description
  ----------------------	----------------------	----------------------------------------
  type	                  String	                Type of the result, must be document
  id	                    String	                Unique identifier for this result, 1-64 bytes
  title	                  String	                Title for the result
  caption	                String	                Optional. Caption of the document to be sent, 0-1024 characters after entities parsing
  parse_mode	            String	                Optional. Mode for parsing entities in the document caption. See formatting options for more details.
  caption_entities	      Array of MessageEntity	Optional. List of special entities that appear in the caption, which can be specified instead of parse_mode
  document_url	          String	                A valid URL for the file
  mime_type	              String	                MIME type of the content of the file, either “application/pdf” or “application/zip”
  description	            String	                Optional. Short description of the result
  reply_markup	          InlineKeyboardMarkup	  Optional. Inline keyboard attached to the message
  input_message_content	  InputMessageContent	    Optional. Content of the message to be sent instead of the file
  thumbnail_url	          String	                Optional. URL of the thumbnail (JPEG only) for the file
  thumbnail_width	        Integer	                Optional. Thumbnail width
  thumbnail_height	      Integer	                Optional. Thumbnail height
  */
  console.log('test send');

  const FD = new FormData();

  if (params?.sendAdmin) {
    // Если указана отправка сообщения админу
  }

  FD.append('user_id', ID?.user?.id.toString() || '');
  FD.append('result', JSON.stringify(msg));
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
    console.log(PIM.id);
    postEvent('web_app_send_prepared_message', {
      id: PIM.id.toString()
    });
    on('prepared_message_sent', (data) => { 
      console.log(data);
      // убрать setEventStatus
      //setEventStatus && setEventStatus(String(data)); 
    });
    on('prepared_message_failed', (data) => {
      console.log(data);
      //setEventStatus && setEventStatus(String(data));
    });
  }).catch((error) => {
    console.log(error);
  });
}

// Функция на замену doPDF и sendPDF
function doWithCalculation(
  mainTable: MainTableRow[],
  InitialData?: any,
  func?: IDoWithPDF,
  setEventStatus?: (data: string) => void
) {

  const EventStatus = 'Обработка результата расчёта ...';
  setEventStatus && setEventStatus(EventStatus);
  const ID = InitialData || '';
  
  let currentShortRow: ShortTableRow | null = null; // текущая строка

  let lastShortRow: ShortTableRow | null = null; // предыдущая строка в группе
  let lastRow: MainTableRow | null = null; // предыдущая строка главной таблицы
  let lastDaysInYear = 365; // количество дней в году по умолчанию

  let rows: ShortTableRow[] = [];

  mainTable.map((row, index, array) => {
    // количество дней в году для текущей даты
    const daysInYear = getDayOfYear(new Date(row.date.getFullYear(), 11, 31));
    
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
      } as ShortTableRow;
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
    } as ShortTableRow;

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

    const daysInYear = getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

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

  const inputsTable: InputsCalcTable[] = [
    {
      "title": "Расчёт процентов (неустойки)",
      "Calculation": inputsArr,
      "sum": `Итого: ${sum.toFixed(2).toString()}`,
      "comment": "* День уплаты денежных средств включается в период просрочки исполнения денежного обязательства.\n** Сумма процентов за период приводится до 4 знака после запятой.\n*** Общая сумма процентов приводится за 2 знака после запятой."
    }
  ];
  
  func && doGeneratePdf(templateCalcTable, inputsTable, ID, func, 'Расчёт процентов (неустойки)' );
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

export const Calc: FC<CalcProps> = ({type}) => {
  const title = type !== 1 ? 'Расчет процентов по статье 395 ГК РФ': 'Расчет договорной неустойки';
  const [debt, setDebt] = useState<number>(0);
  const [currency, setCurrency] = useState(1); // 1 - RUB, 2 - USD, 3 - EUR
  const [datefrom, setDateFrom] = useState<Date>();
  const [dateto, setDateTo] = useState<Date>();
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [rate, setRate] = useState(0);
  const [periodtype, setPeriodType] = useState(1); // 1 - День, 2 - Год
  const [USD, setUSD] = useState(0);
  const [EUR, setEUR] = useState(0);
  console.log('USD: ', USD);
  console.log('EUR: ', EUR);
  // Платежи в погашение долга
  const [DebtDecrease, setDebtDecrease] = useState<DebtRow[]>(debtdecrease);

  // Увеличение долга
  const [DebtIncrease, setDebtIncrease] = useState<DebtRow[]>(debtincrease);

  // usestate
  const [Rows, setRows] = useState<ShortTableRow[]>(); // текущая группа
  
  const [sum, setSum] = useState(0);

  const [crushedData, setCrushedData] = useState<string>('');

  const [eventStatus, setEventStatus] = useState<string>(''); // Статусы события

  // Define Mini Apps event handlers to receive 
  // events from the Telegram native application.
  // defineEventHandlers();

  const LP = retrieveLaunchParams();
  console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  //const IDRaw = retrieveRawInitData();

  //const LP = useLaunchParams();
  //const ID = LP.initData;
  console.log('ID: ', ID?.user?.id);

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
}    );

    const from = datefrom !== undefined ? Number(datefrom.toLocaleDateString().replace('.','').replace('.','')) : 0;
    const to = dateto !== undefined ? Number(dateto.toLocaleDateString().replace('.','').replace('.','')) : 0;

    return  [
              [type, debt, currency, rate, periodtype],
              [from, to],
              [decrease, increase]
            ];
  }

  // Сжатие параметров расчёта для url
  function crushedCalcData() {
    const calcData = doCalcData();
    const crushed = jsoncrush.default.crush(JSON.stringify(calcData));
    setCrushedData(crushed);
    console.log('crushed length: ', crushed.length);
    return crushed;
  }

  // Получение параметров расчёта из url
  function uncrushedCalcData(crushed?: string) {
    const uncrushed = crushed !== undefined ? JSON.parse(jsoncrush.default.uncrush(crushed)) : crushedData;
    console.log('uncrushed: %o', uncrushed);
    return uncrushed;
  }

  useEffect(() => {
    if (datefrom && dateto) {
      const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
      //setMainTable(newMainTable);
      const newShortTable = doShortTable(newMainTable);
      const calcData = doCalcData();
      console.log(calcData);
      console.log('crushedCalcData: ', crushedCalcData());
      uncrushedCalcData(crushedCalcData()); // удалить после тестирования

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun("Hello World"),
                  new TextRun({
                      text: "Foo Bar",
                      bold: true,
                  }),
                  new TextRun({
                      text: "\tGithub is the best",
                      bold: true,
                  }),
                ],
              }),
            ],
          },
        ],
      });
      
      // Used to export the file into a blob
      Packer.toBlob(doc).then((blob) => {
        let dataURL = URL.createObjectURL(blob);
        console.log(dataURL);
      });
    

      setRows(newShortTable);

      getCurrencies().then((result)=>{
        // устанавливаем курс доллара и евро
        setUSD(result.USD);
        setEUR(result.EUR);
        console.log(result);
      });
      
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


  function getMaxDebtRowId( array: DebtRow[] ) {
    let maxId = 0;
    for (let i = 0; i < array.length; i++) if (array[i].id > maxId) maxId = array[i].id;
    return maxId;
  }

  function doShortTable(mainTable: MainTableRow[]) {
    
    let currentShortRow: ShortTableRow | null = null; // текущая строка
    let lastShortRow: ShortTableRow | null = null; // предыдущая строка в группе
    let lastRow: MainTableRow | null = null; // предыдущая строка главной таблицы
    let lastDaysInYear = 365; // количество дней в году

    let rows: ShortTableRow[] = [];


    mainTable.map((row, index, array) => {
      const daysInYear = getDayOfYear(new Date(row.date.getFullYear(), 11, 31));

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
        } as ShortTableRow;
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
      } as ShortTableRow;

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

      const daysInYear = getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

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
        
    const keyratesTable = doKeyRatesTable(); // ключевые ставки по дням
    console.log(keyratesTable);

    const newMainTable: MainTableRow[] = [];
    const n = getDays(from, to);
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

      const daysInYear = getDayOfYear(new Date(indexDate.getFullYear(), 11, 31));

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

      const newRow: MainTableRow = {
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

  const calcRowTemplate = (Row: ShortTableRow, index: number) => {
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
                        Row.pcnt?.toFixed(2) + ' % / ' + getDayOfYear(new Date(Row.e.getFullYear(), 11, 31)):
                        Row.pcnt !== undefined && (Row.pcnt / getDayOfYear(new Date(Row.e.getFullYear(), 11, 31))).toFixed(4) + ' %'
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
              <div
                className="inline-block h-rem text-left app theme-accent-text-color"
              >
                Сумма процентов: {sum && parseFloat(sum.toFixed(2)).toLocaleString()} {currencies.filter(c => c.value === currency)[0]?.name}
              </div>
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
          body={
            <div style={{width: '100%'}} className='flex justify-content-start'>
                <Button
                  className='btntest mt-2'
                  onClick={
                    () => {
                      // необходимо получить id документа и передать его в sendPDF
                      if (datefrom && dateto) {
                        const newMainTable = doMainTable(datefrom, dateto, type, rate, periodtype);
                        //sendPDF(newMainTable, ID, setEventStatus);
                        doWithCalculation(newMainTable, ID, sendPreparedBlob, setEventStatus)
                      }

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

                    }
                  }
                >
                  Тест отправки
                </Button>
                <span>{ eventStatus }</span>
            </div>
          }
          subheaderNoWrap
          borderBottom
        />
        {/* --раздел-- */}
        <AppSection
          header={'Заголовок 3'}
          subheader={'Подзаголовок 3'}
          body={
            <div style={{width: '100%'}} className='flex justify-content-start'>
                <Button
                  className='btntest mt-2'
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
                  Тест PDF
                </Button>
                <span>{ eventStatus }</span>
            </div>
          }
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


// функция для создания файла PDF
// модификация doShortTable()
// вызывается по кнопке Тест PDF

/////////
///////// Оптимизировать код функции doPDF и sendPDF
/////////
/*
function doPDF(
  mainTable: MainTableRow[],
  InitialData?: any,
  setEventStatus?: (data: string) => void
) {

  const EventStatus = 'Отправка PDF боту...';
  setEventStatus && setEventStatus(EventStatus);
  const ID = InitialData || '';
  
  let currentShortRow: ShortTableRow | null = null; // текущая строка

  let lastShortRow: ShortTableRow | null = null; // предыдущая строка в группе
  let lastRow: MainTableRow | null = null; // предыдущая строка главной таблицы
  let lastDaysInYear = 365; // количество дней в году по умолчанию

  let rows: ShortTableRow[] = [];

  mainTable.map((row, index, array) => {
    // количество дней в году для текущей даты
    const daysInYear = getDayOfYear(new Date(row.date.getFullYear(), 11, 31));
    
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
      } as ShortTableRow;
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
    } as ShortTableRow;

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

    const daysInYear = getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

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

  const inputsTable: InputsCalcTable[] = [
    {
      "title": "Расчёт процентов (неустойки)",
      "Calculation": inputsArr,
      "sum": `Итого: ${sum.toFixed(2).toString()}`,
      "comment": "* День уплаты денежных средств включается в период просрочки исполнения денежного обязательства.\n** Сумма процентов за период приводится до 4 знака после запятой.\n*** Общая сумма процентов приводится за 2 знака после запятой."
    }
  ];

  // генерация PDF с обработкой результата через обратный вызов
  doGeneratePdf(templateCalcTable, inputsTable, ID, sendDocumentBlob );
}

// Почти тоже самое что и doPDF, но с отправкой файла выбранному пользователю
function sendPDF(
  mainTable: MainTableRow[],
  InitialData?: any,
  setEventStatus?: (data: string) => void
) {

  const EventStatus = 'Отправка PDF выбранному пользователю...';
  setEventStatus && setEventStatus(EventStatus);
  const ID = InitialData || '';
  
  let currentShortRow: ShortTableRow | null = null; // текущая строка

  let lastShortRow: ShortTableRow | null = null; // предыдущая строка в группе
  let lastRow: MainTableRow | null = null; // предыдущая строка главной таблицы
  let lastDaysInYear = 365; // количество дней в году по умолчанию

  let rows: ShortTableRow[] = [];

  mainTable.map((row, index, array) => {
    // количество дней в году для текущей даты
    const daysInYear = getDayOfYear(new Date(row.date.getFullYear(), 11, 31));
    
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
      } as ShortTableRow;
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
    } as ShortTableRow;

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

    const daysInYear = getDayOfYear(new Date(row.s.getFullYear(), 11, 31));

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

  const inputsTable: InputsCalcTable[] = [
    {
      "title": "Расчёт процентов (неустойки)",
      "Calculation": inputsArr,
      "sum": `Итого: ${sum.toFixed(2).toString()}`,
      "comment": "* День уплаты денежных средств включается в период просрочки исполнения денежного обязательства.\n** Сумма процентов за период приводится до 4 знака после запятой.\n*** Общая сумма процентов приводится за 2 знака после запятой."
    }
  ];
  
  doGeneratePdf(templateCalcTable, inputsTable, ID, sendPreparedBlob );
}*/