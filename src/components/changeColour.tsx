import { Popover } from '@headlessui/react';
import * as React from 'react';

import { ThemeContext } from '../themeManager';

function ThemeIndicator(props: any) {
  return (
    <ThemeContext.Consumer>
      {(themeChanger: any) =>
        themeChanger.currentColour === props.match ? (
          <div className='my-auto mr-2 inline-block h-2 w-2 rounded-full bg-green-500'></div>
        ) : (
          <div className='my-auto mr-2 inline-block h-2 w-2 rounded-full'></div>
        )
      }
    </ThemeContext.Consumer>
  );
}

export function ChangeColour() {
  return (
    <ThemeContext.Consumer>
      {(themeChanger: any) => (
        <Popover className='relative '>
          <Popover.Button>
            <div
              className='rounded-full px-2 py-2 text-gray-900 drop-shadow-md  dark:text-gray-200'
              suppressHydrationWarning={true}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-5 w-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z'
                />
              </svg>
            </div>
          </Popover.Button>

          <Popover.Panel className='absolute right-0 top-10 z-40 rounded-lg bg-gray-100 text-black dark:bg-slate-900'>
            <div className='z-20'>
              <div
                className='border px-2 py-1 dark:border-gray-600 dark:text-white'
                onClick={() => {
                  themeChanger.makeLight();
                }}
              >
                <div className='flex flex-row'>
                  {' '}
                  <ThemeIndicator match='light' />
                  Light
                </div>
              </div>
              <div
                onClick={() => {
                  themeChanger.makeDark();
                }}
                className='border px-2 py-1 dark:border-gray-600 dark:text-white'
              >
                <div className='flex flex-row'>
                  <ThemeIndicator match='dark' />
                  Dark
                </div>
              </div>
              <div
                onClick={() => {
                  themeChanger.makeSystem();
                }}
                className='border px-2 py-1 dark:border-gray-600 dark:text-white'
              >
                <div className='flex flex-row'>
                  <ThemeIndicator match='system' />
                  System
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Popover>
      )}
    </ThemeContext.Consumer>
  );
}
