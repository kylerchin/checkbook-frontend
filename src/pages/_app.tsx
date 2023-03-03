import { datadogRum } from '@datadog/browser-rum';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
/**
 * !STARTERCONF info
 * ? `Layout` component is called in every page using `np` snippets. If you have consistent layout across all page, you can add it here too
 */
import TagManager from 'react-gtm-module';

import '@/styles/globals.css';
// !STARTERCONF This is for demo purposes, remove @/styles/colors.css import immediately
import '@/styles/colors.css';

import { ThemeContext } from './../themeManager';

const tagManagerArgs = {
  gtmId: 'G-TRM4TBWR98',
};
try {
  datadogRum.init({
    applicationId: '0f167d08-abab-4f76-bdc7-71efacca54d8',
    clientToken: 'pub15407666c25ebb17ff50cdde4892057f',
    site: 'datadoghq.com',
    service: 'checkbook',
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'allow',
  });

  datadogRum.startSessionReplayRecording();
} catch (datadogerr) {
  console.error(datadogerr);
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  });

  useEffect(() => {
    const htmlSelected = document.querySelector('html');

    if (htmlSelected) {
      htmlSelected.classList.add('dark');
    }
  }, []);

  const [currentColour, setCurrentColour] = useState<string>('system');

  const dontburnmyeyes = () => {
    const bodySelected = document.querySelector('body');

    if (bodySelected) {
      bodySelected.classList.remove('dontburnmyeyesoutplz');
    }
  };

  function updateSystem() {
    let tosetcolour = 'system';

    if (typeof document !== 'undefined') {
      console.log('inside document');
      const bodySelected = document.querySelector('body');
      const htmlSelected = document.querySelector('html');

      if (localStorage.theme === 'dark') {
        tosetcolour = 'dark';
      }
      if (localStorage.theme === 'light') {
        tosetcolour = 'light';
      }

      if (currentColour !== tosetcolour) {
        setCurrentColour(tosetcolour);
      }

      if (typeof window != undefined) {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (
          localStorage.theme === 'dark' ||
          (!('theme' in localStorage) &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
          if (bodySelected) {
            bodySelected.classList.add('dark');
            bodySelected.classList.add('dark:bg-bruhdark');
            bodySelected.classList.add('dark:bg-bruhdark');
          }

          if (htmlSelected) {
            htmlSelected.classList.add('dark');
          }
        } else {
          if (bodySelected) {
            bodySelected.classList.remove('dark');
            dontburnmyeyes();
          }

          if (htmlSelected) {
            htmlSelected.classList.remove('dark');
          }
        }
      }
    }
  }

  function makeLight() {
    console.log('make light');
    // Whenever the user explicitly chooses light mode
    localStorage.theme = 'light';
    updateSystem();
    dontburnmyeyes();
  }

  function makeDark() {
    // Whenever the user explicitly chooses dark mode
    console.log('make dark');
    localStorage.theme = 'dark';
    updateSystem();
  }

  function makeSystem() {
    // Whenever the user explicitly chooses to respect the OS preference
    console.log('make sys');
    localStorage.removeItem('theme');
    updateSystem();
    dontburnmyeyes();
  }

  updateSystem();

  const themeChanger: any = {
    makeLight,
    makeDark,
    makeSystem,
    updateSystem,
    currentColour,
  };

  useEffect(() => {
    updateSystem();
  });

  return (
    <ThemeContext.Provider value={themeChanger}>
      <Component {...pageProps} themeChanger={themeChanger} />
    </ThemeContext.Provider>
  );
}

export default MyApp;
