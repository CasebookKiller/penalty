import { type FC, useMemo } from 'react';
import { retrieveLaunchParams, retrieveRawInitData, type User } from '@telegram-apps/sdk-react';

import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData.tsx';

import './InitDataPage.css';

function getUserRows(user: User): DisplayDataRow[] {
  console.log('user: ', user);
  const {
    id,
    username,
    photo_url: photoUrl,
    last_name: lastName,
    first_name: firstName,
    is_bot: isBot,
    is_premium: isPremium,
    language_code: languageCode,
    allows_write_to_pm: allowsWriteToPm,
    added_to_attachment_menu: addedToAttachmentMenu,
  } = user;

  return [
    { title: 'id', value: id },
    { title: 'username', value: username },
    { title: 'photo_url', value: photoUrl },
    { title: 'last_name', value: lastName },
    { title: 'first_name', value: firstName },
    { title: 'is_bot', value: isBot },
    { title: 'is_premium', value: isPremium },
    { title: 'language_code', value: languageCode },
    { title: 'allows_to_write_to_pm', value: allowsWriteToPm },
    { title: 'added_to_attachment_menu', value: addedToAttachmentMenu },
  ];
}

export const InitDataPage: FC = () => {
  console.log('InitDataPage: ', window.location);
  console.log('history:', history)
  const LP = retrieveLaunchParams();
  console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const initData = tgWebAppData;
  const initDataRaw = retrieveRawInitData();

  const initDataRows = useMemo<DisplayDataRow[] | any>(() => {
    if (!initData || !initDataRaw) {
      return;
    }
    console.log('initData: ', initData);
    
    const { 
      auth_date: authDate,
      auth_date_raw: authDateRaw,
      hash,
      can_send_after: canSendAfter,
      query_id: queryId,
      start_param: startParam,
      chat_type: chatType,
      chat_instance: chatInstance,
    } = initData;

    return [
      { title: 'raw', value: initDataRaw },
      { title: 'auth_date', value: authDate.toLocaleString() },
      { title: 'auth_date (raw)', value: authDateRaw || new Date(authDate.toLocaleString()).getTime() / 1000 },
      { title: 'hash', value: hash },
      { title: 'can_send_after (raw)', value: canSendAfter },
      { title: 'query_id', value: queryId },
      { title: 'start_param', value: startParam },
      { title: 'chat_type', value: chatType },
      { title: 'chat_instance', value: chatInstance },
    ];
  }, [initData, initDataRaw]);

  console.log('%cinitData: %o', 'color: red', initData?.user);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initData && initData.user ? getUserRows(initData.user) : undefined;
  }, [initData]);

  const receiverRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initData && initData.receiver ? getUserRows(initData.receiver) : undefined;
  }, [initData]);

  const chatRows = useMemo<DisplayDataRow[] | any>(() => {
    if (!initData?.chat) {
      return;
    }
    const { id, title, type, username, photoUrl } = initData.chat;

    return [
      { title: 'id', value: id.toString() },
      { title: 'title', value: title },
      { title: 'type', value: type },
      { title: 'username', value: username },
      { title: 'photo_url', value: photoUrl },
    ];
  }, [initData]);

  if (!initDataRows) {
    return (
      <>
        <div>
          <section className="app placeholder">
            <img
              alt="Наклейка Telegram"
              src="https://casebookkiller.github.io/prime-reactjs-template/telegram.gif" 
              style={{display: 'block', width: '144px', height: '144px'}}
            />
            <dl>
              <dt>
                Ой
              </dt>
              <dd>
                Приложение было запущено с отсутствующими данными инициализации
              </dd>
            </dl>
          </section>
        </div>
      </>
    );
  }
  
  return (
    <div>
      {<DisplayData header={'Данные инициализации'} rows={initDataRows}/>}
      {userRows && <DisplayData header={'Пользователь'} rows={userRows}/>}
      {receiverRows && <DisplayData header={'Получатель'} rows={receiverRows}/>}
      {chatRows && <DisplayData header={'Чат'} rows={chatRows}/>}
    </div>
  );
};
