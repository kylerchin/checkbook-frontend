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

const tagManagerArgs = {
  gtmId: 'GTM-MQG62S5',
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

  const [darkmode, setdarkmode] = useState<boolean | null>(null);

  function updateSystem() {
    const bodySelected = document.querySelector('body');

    if (bodySelected) {
      bodySelected.classList.add('dark:bg-gray-900');
    }

    const htmlSelected = document.querySelector('html');

    if (htmlSelected) {
      htmlSelected.classList.add('dark');
    }

    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      if (bodySelected) {
        bodySelected.classList.add('dark');
        bodySelected.classList.add('dark:bg-gray-900');
      }
    } else {
      if (bodySelected) {
        bodySelected.classList.remove('dark');
      }
    }
  }

  useEffect(() => {
    updateSystem();
  });

  function makeLight() {
    // Whenever the user explicitly chooses light mode
    localStorage.theme = 'light';
    updateSystem();
  }

  function makeDark() {
    // Whenever the user explicitly chooses dark mode
    localStorage.theme = 'dark';
    updateSystem();
  }

  function makeSystem() {
    // Whenever the user explicitly chooses to respect the OS preference
    localStorage.removeItem('theme');
    updateSystem();
  }

  const themeChanger: any = {
    makeLight,
    makeDark,
    makeSystem,
  };

  return <Component {...pageProps} themeChanger={themeChanger} />;
}

export default MyApp;
