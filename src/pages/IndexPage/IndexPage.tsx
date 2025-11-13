/**
 * Настройки режима отладки
 */
//const development = false;
const qrDebug = true;
//const idsDebug = false;

const onTestPages = false;

import * as packageJson from '../../../package.json';
const version = packageJson.version;

import React, { createContext, useContext, useEffect, useRef, useState, type FC } from 'react';

import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Messages } from 'primereact/messages';

import { useMountEffect } from 'primereact/hooks';

import { Link } from '@/components/Link/Link.tsx';

import './IndexPage.css';

import tonSvg from './ton.svg';

import { retrieveLaunchParams, qrScanner, miniApp } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';
import { QrCodeScan } from 'react-bootstrap-icons';

// сбросить статус баннера с сообщением
//sessionStorage.setItem('bannerLinkHide', 'false');
// 


const AppHeader: FC = () => {
  const SBase = useContext(SBaseContext); 
  const [ids, setIds] = useState<TGID[]>(); console.log('ids: ', ids);

  const msgs = useRef<Messages>(null);
  const navigate = useNavigate();

  const LP = retrieveLaunchParams();
  console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  const SP = ID?.start_param
  console.log('start_param: ', SP);

  let calcdata: CalcData|undefined = [
    [0,0,0,0,0],
    [0,0],
    [[[0,0]],[[0,0]]]
  ]; 
  
  calcdata = getCalcData( SP || '');
  console.log('%ccalcdata: %o', `color: ${colors.text_red}`, calcdata);

  const [type, setType] = useState<number| undefined>(calcdata ? calcdata[0][0] : 0);

  //const [link, setLink] = useState<string>('/');

  const isMobile = LP.platform === 'android' || LP.platform === 'ios';
  const qrIsAvailable = miniApp.isMounted() && miniApp.isSupported() && qrScanner.isSupported();

  const [bannerLinkHide, setBannerLinkHide] = useState<boolean>(() => {
    const storedBannerLinkState = sessionStorage.getItem('bannerLinkHide');
    return storedBannerLinkState ? storedBannerLinkState === 'true' : false;
  });

  useEffect(() => {
    sessionStorage.setItem('bannerLinkHide', bannerLinkHide.toString());
  }, [bannerLinkHide]);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useMountEffect(() => {
    if ((type !== 0 && type !== undefined) && msgs.current) {
      if (!bannerLinkHide) {
        msgs.current.clear();
        msgs.current.show({
          severity: 'info',
          sticky: true,
          content: (
            <React.Fragment>
              {/*<img alt="logo" src="https://primefaces.org/cdn/primereact/images/logo.png" width="32" />*/}
              <div className="ml-2">{'Приложение открыто по ссылке с расчётом '}{type !== 1 ? 'процентов по ст.395 ГК РФ' : 'договорной неустойки' }</div>
            </React.Fragment>
          )
        });
      }
    }
  });

  /** ******************** */
  async function getIds() {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from("ids").select();
    console.log('%cids: %o', `color: firebrick; background-color: white`, result.data);  
    setIds(result.data||[]);
  }

  async function getTGId(tgid: string) {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from("ids").select().eq('tgid', tgid);
    console.log('%cid: %o', `color: firebrick; background-color: white`, result.data);  
    return result.data;
  }

  async function checkTGId(tgid: string) {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from("ids").select().eq('tgid', tgid);
    console.log('%cid: %o', `color: firebrick; background-color: white`, result.data);  
    return result.data;
  }

  async function addTGId(tgid: string, username?: string) {
    const result = await SBase
      .from('ids')
      .insert([
        { tgid: tgid, username: username },
      ])
      .select();
      console.log('%cid: %o', `color: firebrick; background-color: white`, result.status);
    return result.data;
  }

  async function addTGIdWithBro(tgid: string, tgbro: string, username?: string) {
    const exist = await SBase
      .from('ids')
      .select('*')
      .eq('tgid', tgid);

    if (exist.data && exist.data.length > 0) {
      console.log('%cid: %o', `color: firebrick; background-color: white`, exist.data);
      return exist.data;
    }

    const result = await SBase
      .from('ids')
      .insert([
        { tgid: tgid, tgbro: tgbro, username: username },
      ])
      .select();
      console.log('%cid: %o', `color: firebrick; background-color: white`, result.status);
    return result.data;
  }

  async function updateTGUsername(tgid: string, username: string) {
    const result = await SBase
      .from('ids')
      .update({ username: username })
      .eq('tgid', tgid)
      .select();
      console.log('%cid: %o', `color: firebrick; background-color: white`, result.status);
    return result.data;
  }

  const headerModal = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <span className="font-bold white-space-nowrap">QR-код некорректен</span>
    </div>
  );

  const footerModal = (
    <div>
      <Button label="Ok" icon="pi pi-check" onClick={() => setModalVisible(false)} autoFocus />
    </div>
  );

  /** ******************** */
  useEffect(()=>{
    let bro: string = '';
    const orderedParams: Param[] = getOrderedParams(SP ?? '', SP?.split(/clc|bro/) ?? []) ?? [];
    orderedParams.forEach((item) => {
      if (item.name === 'bro') {
        bro = NumFromB64(item.value).toString();
        item.value = bro;
      }
    });
    console.log('%corderedParams: ', `background-color: white; color: black;`, orderedParams);

    getIds();
    console.log('%c BRO:::: %o', 'color: red; background: white;', bro);
    console.log('%cID: %o', `color: lightgreen`, ID);
    if (ID?.user?.id) {
      
      getTGId(ID?.user?.id.toString()).then((result) => {
        if (result && result.length > 0) {
          if (result[0].username === null) {
            updateTGUsername(ID?.user?.id.toString() || '', ID?.user?.username || '').then((result) => {
              console.log('%cUpdatedId: %o', `color: lightgreen`, result);
            });
          }
        }
      });

      checkTGId(ID?.user?.id.toString()).then((result) => {
        console.log('ooooooooooooooooooooooooooooooo');
        const length = result?.length || 0;
        if (length > 0) {
          console.log('%c+++++++++++++++++++++++++++++++', `color: yellow`);
          console.log('%cid: %o', `color: yellow`, result);  
        } else {
          console.log('#########');
          if (bro !== '' && length === 0) {
            addTGIdWithBro(ID?.user?.id.toString() || '', bro || '', ID?.user?.username || '').then((result) => {
              console.log('%cid: %o', `color: yellow`, result);  
            });
          } else {
            console.log('%cid: %o', `color: yellow`, 'no bro');
            addTGId(ID?.user?.id.toString() || '', ID?.user?.username || '').then((result) => {
              console.log('%cid: %o', `color: yellow`, result);  
            });
          }
        }
      });
      
    }
  },[]);

  return (
    (isMobile || qrDebug) && (qrIsAvailable || qrDebug) && <React.Fragment>
      <div className='app p-0'/>
      <Panel
        className='shadow-5 mx-1'
        header='Сканер QR-кодов'
      >
        <Dialog
          visible={modalVisible}
          modal
          maximized={true}
          header={headerModal}
          footer={footerModal}
          style={{ width: '50rem' }}
          onHide={() => {if (!modalVisible) return; setModalVisible(false); }}
        >
          <p className="app font-size theme-hint-color font-weight-content">
            Поищите другой код с расчётом.
          </p>
        </Dialog>
        {/* Кнопка сканирования */}
        <Link
          to='#'
          onClick={async ()=>{
            if (qrScanner.open.isAvailable()) {
              if (!isMobile) {
                console.log('QR-код будет сканироваться только в мобильном приложении Telegram');
                //  return;
              }
              if (!qrIsAvailable) {
                console.log('QR-код будет сканироваться только в приложении Telegram');
                //return;
              }
              qrScanner.isOpened(); // false
              const promise = qrScanner.open({
                text: 'с расчетом неустойки или процентов',
                onCaptured(qr: string) {
                  if (qr.includes('https://t.me/'+import.meta.env.VITE_BOT_NAME+'/'+import.meta.env.VITE_APP_NAME+'?startapp=')) {
                    console.log('qr: ', qr);
                    qrScanner.close();
                    sessionStorage.setItem('QRUrl', qr);
                    if (qr!=='') navigate('/qrurl');
                  } else {
                    qrScanner.close();
                    console.log('QR-код некорректен');
                    console.log('Здесь нужно модальное окно с сообщением: Поищите другой код с расчётом.');
                    setModalVisible(true);
                  }
                },
              });
              qrScanner.isOpened(); // true
              await promise;
              qrScanner.isOpened(); // false
            }
          }}
        >
          <div className={(type !== undefined && type !== 0 && bannerLinkHide === false)? 'flex flex-wrap app p-2 align-items-center gap-2 item-border-bottom' : 'flex flex-wrap app p-2 align-items-center gap-2'}>
            <QrCodeScan size={30}/>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                <span>QR-код с расчётом</span>
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Отсканируйте QR-код с расчетом
                </span>
              </div>
            </div>
          </div>
        </Link>
        {/* Кнопка с расчетом по ссылке */}
        { type !== undefined && type !== 0 && bannerLinkHide === false && <Link
          to='/starturl'
          onClick={()=>{
            console.log('%ccalcdata: ','color: blue;', calcdata);
          }}
        >
          <div className='flex app align-items-center gap-2 item-border-bottom w-full'>
            <Messages
              id='messages'
              ref={msgs}
              className='flex-shrink-1 flex w-full'
              onRemove={()=>{
                // при удалении сообщения обнуляяем type
                setType(undefined);
                setBannerLinkHide(true);
              }}
            />
            {/*<div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                <span>Расчёт по ссылке</span>
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content'
                >
                  Приложение открыто по ссылке с расчётом {type !== 1 ? 'по ст.395 ГК РФ' : 'договорной неустойки'}
                </span>
              </div>
            </div>*/}
          </div>
        </Link>}
      </Panel>
    </React.Fragment>
  );
}

// Отсюда надо взять логику с переходом по ссылке

/*
const AppHeader: FC = () => {
  const [code, setCode] = useState<Code>({} as Code);
  const [sum, setSum] = useState<string>('');
  const [link, setLink] = useState<string>('/');
  const [courtType, setCourtType] = useState<string>('');
  const navigate = useNavigate();

  const LP = useLaunchParams();
  const SP = LP.initData?.startParam;

  const isMobile = LP.platform === 'android' || LP.platform === 'ios';
  const qrIsAvailable = miniApp.isMounted() && miniApp.isSupported() && qrScanner.isSupported();

  const [bannerLinkHide, setBannerLinkHide] = useState<boolean>(() => {
    const storedBannerLinkState = sessionStorage.getItem('bannerLinkHide');
    return storedBannerLinkState ? storedBannerLinkState === 'true' : false;
  });

  console.log('%ccode: %o', `color: ${TCLR}`, code);

  let orderedParams: Param[] = [];
  const arr: string[] = SP?.split(/clc|bro/) ?? [];
  orderedParams = getOrderedParams(SP ?? '', arr) ?? [];
  
  useEffect(() => {
    sessionStorage.setItem('bannerLinkHide', bannerLinkHide.toString());
  }, [bannerLinkHide]);

  useEffect(() => {
    
    orderedParams.forEach((item) => {
      if (item.name === 'clc') {
        let _code = link2code(prepareHash(item.value)); 
        let _sum = '';
        setCode(_code);
        console.log('%cclc: %o', `color: ${TCLR}`, _code);
        
        if ( _code.sou !== '' ) {
          _sum = _code.sou;
          setCourtType('sou');
        } else if ( _code.arb !== '' ) {
          _sum = _code.arb;
          setCourtType('arb');
        }
        setLink('/starturl');
        setSum(_sum);
      }
    });
  },[])

  const subtitle = <>
    <div>Приложение открыто по ссылке с расчетом</div>
    <div>{courtType === 'sou' ? ' для суда общей юрисдикции' : courtType==='arb' && ' для арбитражного суда'}</div>
    <div>и с ценой иска: {sum} руб.</div>
  </>;

  return (
    <Section
      style={{ backgroundColor: secondaryBgColor }}
      //header={'Расчет государственной пошлины'}
      header={
        <header style={{
          color: accentTextColor,
          backgroundColor: secondaryBgColor,
          padding: '20px 24px 20px 22px'
        }}
      >
        <h1
          style={{
            fontSize: '18px',
            margin: '0px 0px 0px 0px',
            lineHeight: 'var(--tgui--subheadline2--line_height)',
            fontWeight: 'var(--tgui--font_weight--accent2)'}}
          >Расчёт государственной пошлины</h1>
      </header>}
      //footer={'Налоговый кодекс РФ предусматривает разные варианты расчетов в завсимости от вида суда'}
      footer={
        <footer style={{
          color: accentTextColor,
          backgroundColor: secondaryBgColor,
          padding: '20px 24px 4px 22px'
        }}>
          <h6
            style={{
              fontSize: '14px',
              margin: '0px',
              lineHeight: 'var(--tgui--subheadline2--line_height)',
              fontWeight: 'var(--tgui--font_weight--accent3)'
            }}
          >
            Налоговый кодекс РФ предусматривает разные варианты расчетов в зависимости от вида суда
          </h6>
        </footer>
      }
    >
      {
        (isMobile || qrDebug) && (qrIsAvailable || qrDebug) && <>
          <Banner
            className='banner'
            style={{
              backgroundColor: backgroundColor,
            }}
            before={<QrCodeScan size={30} style={{color: accentTextColor}}/>}
            header={<span style={{
              color: accentTextColor,
              fontWeight: 'var(--tgui--font_weight--accent3)'
            }}>QR-код с расчётом</span>}
            description='Отсканируйте QR-код с расчетом пошлины'
            onClick={async ()=> {
              if (!isMobile) {
                return;
              }
              if (qrScanner.open.isAvailable()) {
                qrScanner.isOpened(); // false
                const promise = qrScanner.open({
                  text: 'с расчетом пошлины',
                  onCaptured(qr: string) {
                    if (qr.includes('https://t.me/'+import.meta.env.VITE_BOT_NAME+'/'+import.meta.env.VITE_APP_NAME+'?startapp=')) {
                      console.log('qr: ', qr);
                      qrScanner.close();
                      sessionStorage.setItem('QRUrl', qr);
                      if (qr!=='') navigate('/qrurl');
                    } else {
                      qrScanner.close();
                      modal.show({
                        title: 'QR-код некорректен',
                        content: <AutoCenter><span style={{color: accentTextColor}}>Поищите другой код с расчётом.</span></AutoCenter>,
                        closeOnAction: true,
                        actions: [
                          {
                            key: 'good',
                            text: 'Хорошо',
                            primary: true,
                            style: {
                              height: '46px',
                              fontSize: '16px',
                              borderColor: buttonColor,
                              color: textColor,
                              backgroundColor: buttonColor
                              }
                            }
                          ],
                          bodyStyle: {
                            color: accentTextColor,
                            backgroundColor: backgroundColor
                          }
                        }
                      );
                    }
                  },
                });
                qrScanner.isOpened(); // true
                await promise;
                qrScanner.isOpened(); // false
              }
            }}
            tabIndex={-1}
          />            
        </>
      }
      {
        link !== '/' &&
        <>
          { !bannerLinkHide && 
          <Banner
            before={<Link45deg size={30} style={{color: accentTextColor}}/>}
            description={ subtitle }
            header={<span style={{
              color: accentTextColor,
              fontWeight: 'var(--tgui--font_weight--accent3)'
            }}>Расчет по ссылке</span>}
            className='banner'
            style={{
              backgroundColor: backgroundColor,
            }}
            onCloseIcon={() => setBannerLinkHide(true)}
            type="section"
          >
            <React.Fragment key=".0">
              <Link to={link}>
                <Button
                  type='primary'
                  style={{
                    height: '32px',
                    borderRadius: '8px'
                  }}
                >
                  Открыть
                </Button>
              </Link>
              <Button
                style={{
                  borderColor: accentTextColor,
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  color: accentTextColor,
                  height: '32px',
                  marginLeft: '8px'
                }}
                onClick={() => setBannerLinkHide(true)}
              >
                Скрыть
              </Button>
            </React.Fragment>
          </Banner>
          }
        </>
      }
    </Section>
  )
}
*/

/*
const QRHeader: FC = () => {
  const navigate = useNavigate();

  const LP = retrieveLaunchParams();
  const tgWebAppData = LP?.tgWebAppData;
  const initData = tgWebAppData;
  const SP = initData?.start_param

  const isMobile = LP.platform === 'android' || LP.platform === 'ios';
  const qrIsAvailable = miniApp.isMounted() && miniApp.isSupported() && qrScanner.isSupported();

  return (
    <React.Fragment>
      <div style={{color: 'white'}}>Сканер QR-кодов{SP ? ' (Параметр: ' + SP + ')': ''}</div>
      <div style={{color: 'white'}}>{isMobile && qrIsAvailable ? 'mobile' : 'desktop'}</div>
    </React.Fragment>
  );
}
*/


import { MissionsPage } from '../MissionsPage/MissionsPage';
import { CalcData, getCalcData, colors, Param, getOrderedParams, NumFromB64 } from '../../components/Calc/common';

import Supabase from '../../supabaseClient';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
const SBaseContext = createContext(Supabase);

interface TGID {
  created_at: string;
  id: number;
  tgid: string;
  username: string | null;
  tgbro: string | null;
}

export const IndexPage: FC = () => {
  const LP = retrieveLaunchParams();
  console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  const SP = ID?.start_param
  console.log('start_param: ', SP);
  const [userId] = useState<string>(ID?.user?.id.toString() || '');
  
  return (
    <React.Fragment>
      { onTestPages && <div className='app p-0'/> }
      { onTestPages && <Panel
          className='shadow-5 mx-1'
          header={'Особенности'}
          footer={'Вы можете воспользоваться этими страницами, чтобы узнать больше о функциях, предоставляемых мини-приложениями Telegram и другими полезными проектами'}
        >
          {/*<div>{"==="+location.pathname+'==='}</div>*/}
          <Link to='/ton-connect'>
            <div className='flex flex-wrap app p-2 align-items-center gap-4'>
              <img
                className='w-2-5rem shadow-2 flex-shrink-0 border-round'
                style={{ backgroundColor: '#007AFF' }}
                src={tonSvg}
                alt='TON Connect'
              />
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >TON Connect</span>
                <div className='flex align-items-center gap-2'>
                  {/*<i className="pi pi-tag text-sm"></i>*/}
                  <span
                    className='app font-size theme-hint-color font-weight-content'
                  >
                    Подключите свой кошелек TON
                  </span>
                </div>
              </div>
              {/*<span className="font-bold text-900">$65</span>*/}
            </div>
          </Link>
        </Panel>
      }
      { onTestPages && <div className='app p-0'/> }
      { onTestPages && <Panel
          className='shadow-5 mx-1'
          header={'Данные о запуске приложения'}
          footer={'Эти страницы помогают разработчикам узнать больше о текущей информации о запуске'}
        >
          <Link to='/init-data'>
            <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >
                  Данные инициализации
                </span>
                <div className='flex align-items-center gap-2'>
                  <span
                    className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                  >
                    Пользовательские данные, информация о чате, технические данные
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link to='/launch-params'>
            <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >
                  Параметры запуска
                </span>
                <div className='flex align-items-center gap-2'>
                  <span
                    className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                  >
                    Идентификатор платформы, версия мини-приложения и т.д.
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link to='/theme-params'>
            <div className='flex flex-wrap app p-2 align-items-center gap-4'>
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >
                  Параметры темы
                </span>
                <div className='flex align-items-center gap-2'>
                  <span
                    className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                  >
                    Информация о палитре приложений Telegram
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Panel>
      }
      { onTestPages && <div className='app p-0'/> }
      { onTestPages && <Panel
          className='shadow-5 mx-1'
          header='База данных и задания'
          footer='Этот раздел помогает разработчикам настроить подключение supabase к своему мини-приложению и организовать подписку на чаты и каналы'
        >
          <Link to='/supabase'>
            <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >
                  База данных
                </span>
                <div className='flex align-items-center gap-2'>
                  <span
                    className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                  >
                    Идентификаторы пользователей приложения
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link to='/missions'>
            <div className='flex flex-wrap align-items-center gap-4 app p-2'>
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >
                  Задания
                </span>
                <div className='flex align-items-center gap-2'>
                  <span
                    className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                  >
                    Задания для пользователей, проверка подписки на чаты и каналы
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Panel>
      }
      
      { true && <div className='app p-0'/> }
      { true && <AppHeader/>}

      <div className='app p-0'/>
      <Panel
        className='shadow-5 mx-1'
        header='Калькуляторы'
        footer='Этот раздел содержит калькуляторы для расчёта неустойки и процентов по статьей 395 ГК РФ.'
      >
        <Link to='/penalty'>
          <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Расчёт неустойки
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Расчёт договорной неустойки
                </span>
              </div>
            </div>
          </div>
        </Link>
        <Link to='/gk395'>
          <div className='flex flex-wrap align-items-center gap-4 app p-2'>
            <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
              <span
                className='app font-size-subheading'
              >
                Расчёт процентов за пользование чужими денежными средствами
              </span>
              <div className='flex align-items-center gap-2'>
                <span
                  className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                >
                  Расчет в соответствии со статьей 395 ГК РФ
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Panel>
      <MissionsPage/>
      <div
        className='my-5 mx-2 app theme-hint-color theme-bg-secondary text-xs'
      >
        <div className='block text-center mb-2'>
          <Chip className='text-2xs shadow-3' label={'UId: ' + userId}/>
        </div>
        <div className='block text-center mb-2'>
          <span>{'Платформа: ' + LP.tgWebAppPlatform}</span>
        </div>
        <div className='block text-center mb-1'>
          <span>Калькулятор неустойки и процентов за пользование чужими денежными средствами</span>
        </div>
        <div className='block text-center mb-1'>
          <span>Версия {version}</span>
        </div>
        <div className='block text-center mb-3'>
          <span>@2024-2025</span>
        </div>

      {
      /*
      <AutoCenter style={{margin: '4px 4px', color: hintColor}}>
        <Button
          size='small'
          style={{backgroundColor: secondaryBgColor, color: hintColor, fontSize: '10px'}}
          onClick={()=>handleClick()}
        >UId: {userId}</Button>
      </AutoCenter>
      <AutoCenter style={{margin: '4px 4px', color: hintColor}}><span>Калькулятор пошлины</span></AutoCenter>
      <AutoCenter style={{margin: '4px 4px', color: hintColor}}><span>Версия {version}</span></AutoCenter>
      <AutoCenter style={{margin: '4px 4px', color: hintColor}}><span>© 2024-2025</span></AutoCenter>
      */
      }
    </div>
    </React.Fragment>
  );
};
