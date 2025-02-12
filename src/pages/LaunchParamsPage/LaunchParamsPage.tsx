import { useLaunchParams } from '@telegram-apps/sdk-react';
import type { FC } from 'react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

export const LaunchParamsPage: FC = () => {
  const lp = useLaunchParams();

  return (
    <div>
      <DisplayData
        header={'Параметры запуска'} 
        rows={[
          { title: 'tgWebAppPlatform', value: lp.platform },
          { title: 'tgWebAppShowSettings', value: lp.showSettings },
          { title: 'tgWebAppVersion', value: lp.version },
          { title: 'tgWebAppBotInline', value: lp.botInline },
          { title: 'tgWebAppStartParam', value: lp.startParam },
          { title: 'tgWebAppData', type: 'link', value: '/init-data' },
          { title: 'tgWebAppThemeParams', type: 'link', value: '/theme-params' },
        ]}
      />
    </div>
  );
};
