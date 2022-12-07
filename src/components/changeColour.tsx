import { Popover } from '@headlessui/react';

export function ChangeColour(props: any) {
  return (
    <Popover className='relative'>
      <Popover.Button>
        <div className='rounded-full px-2 py-2 text-gray-900 drop-shadow-md  dark:text-gray-200'>
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

      <Popover.Panel className='absolute right-0 top-10 z-20 rounded-lg dark:bg-slate-900'>
        <div className='z-20'>
          <div
            className='border px-2 py-1 dark:border-gray-600'
            onClick={() => {
              props.themeChanger.makeLight();
            }}
          >
            Light
          </div>
          <div
            onClick={() => {
              props.themeChanger.makeDark();
            }}
            className='border px-2 py-1 dark:border-gray-600'
          >
            Dark
          </div>
          <div
            onClick={() => {
              props.themeChanger.makeSystem();
            }}
            className='border px-2 py-1 dark:border-gray-600'
          >
            System
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
}
