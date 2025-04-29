import {
  //shareURL,
  //popup,
  //mainButton,
  backButton,
//  useLaunchParams,
//  miniApp,
//  themeParams,
//  viewport,
//  init,
  retrieveLaunchParams
} from '@telegram-apps/sdk-react';
import { type FC,
//  startTransition,
  useEffect,
//  useMemo
} from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { Route as AppRoute,routes } from '@/navigation/routes.tsx';
import { PenaltyPage } from '@/pages/PenaltyPage/PenaltyPage';
import { GK395Page } from '@/pages/GK395Page/GK395Page';

function BackButtonManipulator() {
  const location = useLocation();
  const navigate = useNavigate();

  //if (!backButton.isMounted()) backButton.mount();

  useEffect(() => {
    function onClick() {
      navigate(-1);
    }
    backButton.onClick(onClick);

    return () => backButton.offClick(onClick);
  }, [navigate]);

  useEffect(() => {
    console.log('location.pathname: ', location.pathname);
    if (backButton.isSupported() && !backButton.isMounted()) backButton.mount();

    if (location.pathname === '/' ) {
      if (backButton.isSupported() && backButton.isMounted()) backButton.hide();
    } else {
      if (backButton.isSupported() && backButton.isMounted()) backButton.show();
    }

    //if (location.pathname === '/' || location.pathname === '/penalty/' ) {
      //if (!backButton.isMounted()) backButton.mount();

    //  if (backButton.isSupported() && backButton.isMounted()) {
    //    !backButton.isVisible() && backButton.hide();
    //  }
    //} else {
    //  if (!backButton.isMounted()) backButton.mount();

    //  if (backButton.isSupported() && backButton.isMounted()) {
    //    !backButton.isVisible() && backButton.show();
    //  }
    //}
  }, [location]);
  
  return null;
}

/*
function MainButtonManipulator() {
  
  const location = useLocation();

  let mainButtonParams = {
    backgroundColor: themeParams.buttonColor() || '#2990ff',
    textColor: themeParams.buttonTextColor() || '#ffffff',
    text: 'Поделиться приложением'
  }
  
  if (!mainButton.isMounted()) mainButton.mount();
  mainButton.setParams(mainButtonParams);
  if (location.pathname === '/') mainButton.mount();
  console.log('Добавлена главная кнопка', mainButton);

  useEffect(() => {
    console.log('location.pathname: ', location.pathname);
    if (location.pathname === '/') {
      mainButton.setParams({ text: 'Поделиться приложением', isVisible: true, isEnabled: true });
      mainButton.mount();
    } else {
      mainButton.setParams({ text: 'Перейдите на главную страницу', isVisible: false, isEnabled: true });
      mainButton.mount();
    }
    mainButton.onClick(() => {
      try {
        console.log('mainButton.onCLick');
        popup.open({
            title: 'Поделиться приложением!',
            message: 'Для того чтобы поделиться приложением, нажмите на кнопку Ok.',
            buttons: [
              { id: 'btnproceed', type: 'default', text: 'Ok' },
              { id: 'btncancel', type: 'cancel' },
            ],
          })
          .then((buttonId: string|null) => {
            if (buttonId === 'btnproceed') {
              const url = 'https://t.me/{reactjs-template}'; //измените путь на путь бота и приложения
              shareURL(`Посмотрите мое приложение ${url}`);
            } else {
              console.log(
                buttonId === null 
                  ? 'Пользователь не нажимал кнопок.'
                  : `Пользователь нажал кнопку с ID "${buttonId}"`
              );
            }
           
          });
  
        console.log(popup.isOpened); // true
        
        console.log('Окно выбора чата открыто для отправки сообщения.');
      } catch (error) {
        console.error('Ошибка при открытии окна выбора чата:', error);
      }
    })
  }, [location]);

  return null;
  
}
*/

export const App: FC = () => {
  const lp = retrieveLaunchParams();
  console.log('lp', lp);

  //startTransition(() => {
  //  console.log('%cminiApp: %o', `color: cyan`, miniApp);
  //});

  useEffect(() => {
    
    //if (!themeParams.isMounted()) themeParams.mount();
    //if (!themeParams.isCssVarsBound()) themeParams.bindCssVars();
    //if (!viewport.isMounted()) viewport.mount();
    //if (!backButton.isMounted()) backButton.mount();

  }, []);

  const penalty: AppRoute = { path: '/penalty', element: <PenaltyPage/>, title: 'Расчёт неустойки' };
  const gk395: AppRoute = { path: '/gk395', element: <GK395Page/>, title: 'Расчёт процентов по ст.395 ГК РФ' };
  
  routes.push(penalty, gk395);


  return (
    <>
      <HashRouter>
        <BackButtonManipulator/>
        {/*<MainButtonManipulator/>*/}
        <Routes>
          {routes.map((route) => {
            console.log('Route: ', route);
            return (<Route key={route.path} {...route} />);
          })}
          <Route path='*' element={<Navigate to={'/'}/>}/>
        </Routes>
      </HashRouter>
    </>
  );
};
