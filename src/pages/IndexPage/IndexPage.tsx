const onTestPages = false;

import * as packageJson from '../../../package.json';
const version = packageJson.version;

import React, { useState, type FC } from 'react';

import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';

import { Link } from '@/components/Link/Link.tsx';

import './IndexPage.css';

import tonSvg from './ton.svg';

import { retrieveLaunchParams, qrScanner, miniApp } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';
import { QrCodeScan } from 'react-bootstrap-icons';
// 

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
      <div>Сканер QR-кодов{SP ? ' (Параметр: ' + SP + ')': ''}</div>
    </React.Fragment>
  );
}
*/

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { MissionsPage } from '../MissionsPage/MissionsPage';

/*
function TemplateDemo() {
  const [visible, setVisible] = useState<boolean>(false);

  const headerModal = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <span className="font-bold white-space-nowrap">QR-код некорректен</span>
    </div>
  );

  const footerModal = (
    <div>
      <Button label="Ok" icon="pi pi-check" onClick={() => setVisible(false)} autoFocus />
    </div>
  );

  return (
    <div className="card flex justify-content-center">
      <Button label="Show" icon="pi pi-external-link" onClick={() => setVisible(true)} />
      <Dialog
        visible={visible}
        modal
        //maximizable={true}
        maximized={true}
        header={headerModal}
        footer={footerModal}
        style={{ width: '50rem' }}
        onHide={() => {if (!visible) return; setVisible(false); }}
      >
        <p className="app font-size theme-hint-color font-weight-content">
          Поищите другой код с расчётом.
        </p>
      </Dialog>
    </div>
  )
}
*/
        
export const IndexPage: FC = () => {
  //const location = useLocation();
  const navigate = useNavigate();

  const LP = retrieveLaunchParams();
  console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  //const SP = ID?.start_param

  const isMobile = LP.platform === 'android' || LP.platform === 'ios';
  const qrIsAvailable = miniApp.isMounted() && miniApp.isSupported() && qrScanner.isSupported();

  //const ID = useLaunchParams().initData;

  const [userId] = useState<string>(ID?.user?.id.toString() || '');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

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
      <div className='app p-0'/>
      <Panel
        className='shadow-5 mx-1'
        header='Сканер QR-кодов'
      >
        <Dialog
          visible={modalVisible}
          modal
          //maximizable={true}
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
                    /*
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
                    */
                  }
                },
              });
              qrScanner.isOpened(); // true
              await promise;
              qrScanner.isOpened(); // false
            }
          }}
        >
          <div className='flex flex-wrap app p-2 align-items-center gap-2 item-border-bottom'>
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
          {/*<div className='flex-1 flex flex-column gap-1 xl:mr-8'>
            <TemplateDemo/>
          </div>*/}
        </Link>
      </Panel>
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
