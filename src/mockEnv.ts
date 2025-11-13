import { mockTelegramEnv, emitEvent, retrieveLaunchParams } from '@telegram-apps/bridge';

// Важно, чтобы имитация среды выполнялась только в целях разработки. При сборке
// приложения значение import.meta.env.DEV станет ложным, а код внутри будет изменен на древовидный,
// поэтому вы не увидите его в своем окончательном пакете.
if (import.meta.env.DEV) {
  let shouldMock: boolean;
  // Попытка извлечь параметры запуска, чтобы проверить, основана ли текущая среда на Telegram.
  try {
    // Если мы можем извлечь параметры запуска, это означает, что мы уже находимся в среде 
    // Telegram. Таким образом, нет необходимости имитировать её.
    retrieveLaunchParams();

    // Ранее мы могли имитировать окружающую среду. В случае, если мы это сделали, мы должны сделать это снова.
    // Потому что страница может быть перезагружена, и мы должны снова использовать имитацию, потому что имитация также
    // позволяет изменять объект window.
    shouldMock = !!sessionStorage.getItem('____mocked');
  } catch (e) {
    shouldMock = true;
  }

  if (shouldMock) {
    console.log("Включена имитация окружающей среды Telegram");
    const noInsets = {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
    } as const;
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;

    const LP = {
      tgWebAppThemeParams: themeParams,
      tgWebAppData: new URLSearchParams([
        ['user', JSON.stringify({
          id: Number(import.meta.env.VITE_MOCK_USER_ID) || 99281932,
          first_name: 'Ivan',
          last_name: 'Petrov',
          username: 'petrov',
          language_code: 'ru',
          is_premium: true,
          allows_write_to_pm: true,
        })],
        ['hash', 'wP0hiNsZtrjRu_f8IE9rbgjic-lnFm4MoSBPKhMvOtZgJDqA8SSQN421SsnqxQResAsZaShR4eUuL4WKUAQLCQ'],
        ['signature', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
        ['auth_date', Date.now().toString()],
        //['start_param', 'debugbro275342303'],
        ['start_param', "debugclc!1.oqw.1.a.2'~2GJ.WQt'(qWh.fE'~qXR.vg'~qZp.KU'](tmx.KU'~to5.vg'~tpF.fE']]!['(,!%01(!_brogqmfv"],
        //['start_param', 'debug'],
        ['chat_type', 'sender'],
        ['chat_instance', '8428209589180549439'],
      ]),
      tgWebAppStartParam: '',//'debug',
      tgWebAppVersion: '9',
      tgWebAppPlatform: 'tdesktop',
    };

    mockTelegramEnv({
      launchParams: LP,
      onEvent(e) {
        if (e[0] === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (e[0] === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
        if (e[0] === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (e[0] === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
    });
    sessionStorage.setItem('____mocked', '1');

    console.info(
      'До тех пор, пока текущая среда не определяется как основанная на Telegram, она будет имитирована. Обратите внимание, что вы не должны делать этого в рабочей среде, а текущее поведение относится только к процессу разработки. Имитирование среды применяется только в режиме разработки. Таким образом, после создания приложения вы не увидите такого поведения и связанного с ним предупреждения, приводящего к сбою приложения вне Telegram.',
    );
  }
}

/*
import { mockTelegramEnv, parseInitData, retrieveLaunchParams } from '@telegram-apps/sdk-react';

// Важно, чтобы имитация среды выполнялась только в целях разработки. При сборке
// приложения значение import.meta.env.DEV станет ложным, а код внутри будет изменен на древовидный,
// поэтому вы не увидите его в своем окончательном пакете.
if (import.meta.env.DEV) {
  let shouldMock: boolean;

  // Попытка извлечь параметры запуска, чтобы проверить, основана ли текущая среда на Telegram.
  try {
    // Если мы можем извлечь параметры запуска, это означает, что мы уже находимся в среде 
    // Telegram. Таким образом, нет необходимости имитировать её.
    retrieveLaunchParams();

    // Ранее мы могли имитировать окружающую среду. В случае, если мы это сделали, мы должны сделать это снова.
    // Потому что страница может быть перезагружена, и мы должны снова использовать имитацию, потому что имитация также
    // позволяет изменять объект window.
    shouldMock = !!sessionStorage.getItem('____mocked');
  } catch (e) {
    shouldMock = true;
  }

  if (shouldMock) {
    const initDataRaw = new URLSearchParams([
      ['user', JSON.stringify({
        id: 275342303,//99281932,
        //id: import.meta.env.VITE_MOCK_USER_ID || 99281932,
        first_name: 'Alexey',//'Ivan',
        last_name: 'Kuznetsov',//'Petrov',
        username: 'kuznetsov_proff',//'petrov',
        language_code: 'ru',
        is_premium: true,
        allows_write_to_pm: true,
        photo_url: 'https:\/\/t.me\/i\/userpic\/320\/2CiqQwc71uCtRJ4U9lDxhNT69Cc80GOQ9siaD9XEbmQ.svg'
      })],
      ['signature', 'wP0hiNsZtrjRu_f8IE9rbgjic-lnFm4MoSBPKhMvOtZgJDqA8SSQN421SsnqxQResAsZaShR4eUuL4WKUAQLCQ'],
      ['hash', '83eb57c847e68e0ae6eab388f3d4d847aa73b2456a3f522ec5a044ece349adb8'],
      ['auth_date', '1733665170'],
      ['start_param', 'debug'],
      //['start_param', 'debugbro275342303'],
      //['start_param', 'debugclcg68979879nhbro99281932'],
      ['chat_type', 'sender'],
      ['chat_instance', '-6224918917665718056'],
    ]).toString();

    mockTelegramEnv({
      themeParams: {
        accentTextColor: '#6ab2f2',
        bgColor: '#17212b',
        buttonColor: '#5288c1',
        buttonTextColor: '#ffffff',
        destructiveTextColor: '#ec3942',
        headerBgColor: '#17212b',
        hintColor: '#708499',
        linkColor: '#6ab3f3',
        secondaryBgColor: '#232e3c',
        sectionBgColor: '#17212b',
        sectionHeaderTextColor: '#6ab3f3',
        subtitleTextColor: '#708499',
        textColor: '#f5f5f5',
      },
      initData: parseInitData(initDataRaw),
      initDataRaw,
      version: '8.3',
      platform: 'tdesktop',
    });
    sessionStorage.setItem('____mocked', '1');

    console.info(
      'До тех пор, пока текущая среда не определяется как основанная на Telegram, она будет имитирована. Обратите внимание, что вы не должны делать этого в рабочей среде, а текущее поведение относится только к процессу разработки. Имитирование среды применяется только в режиме разработки. Таким образом, после создания приложения вы не увидите такого поведения и связанного с ним предупреждения, приводящего к сбою приложения вне Telegram.',
    );
  }
}*/