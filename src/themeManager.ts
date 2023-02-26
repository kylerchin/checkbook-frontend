import * as React from 'react';

function updateSystem() {
  if (typeof document !== 'undefined') {
    const bodySelected = document.querySelector('body');
    const htmlSelected = document.querySelector('html');

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
      }

      if (htmlSelected) {
        htmlSelected.classList.remove('dark');
      }
    }
  }
}

function makeLight() {
  console.log('make light');
  // Whenever the user explicitly chooses light mode
  localStorage.theme = 'light';
  updateSystem();
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
}

updateSystem();

const themeChanger = {
  makeLight,
  makeDark,
  makeSystem,
  updateSystem,
};

export const ThemeContext = React.createContext(themeChanger);
