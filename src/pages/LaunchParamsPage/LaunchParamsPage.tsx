import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import type { FC } from 'react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

function getNode(str: string) {
  return (
    <>
      {str}
    </>
  );
}
export const LaunchParamsPage: FC = () => {
  const lp = retrieveLaunchParams();//useLaunchParams();
  console.log('launchParams: ', lp);
  
  const {
    tgWebAppPlatform: platform,
    tgWebAppShowSettings: showSettings,
    tgWebAppVersion: version,
    tgWebAppBotInline: botInline,
    tgWebAppStartParam: startParam,
  } = lp;

  return (
    <div>
      <DisplayData
        header={'Параметры запуска'} 
        rows={[
          { title: 'tgWebAppPlatform', value: getNode(platform.toString()) },
          { title: 'tgWebAppShowSettings', value: showSettings },
          { title: 'tgWebAppVersion', value: version },
          { title: 'tgWebAppBotInline', value: botInline },
          { title: 'tgWebAppStartParam', value: startParam },
          { title: 'tgWebAppData', type: 'link', value: '/init-data' },
          { title: 'tgWebAppThemeParams', type: 'link', value: '/theme-params' },
        ]}
      />
    </div>
  );
};
