import Link from 'next/link';
import * as React from 'react';

import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';

import backends from '@/backends.json';

export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='mx-auto mx-2 mt-4 dark:text-gray-100'>
        <Seo title='Debug |LA Checkbook' />
        <Link href='/' className='underline'>
          <p className='underline hover:text-blue-900 dark:text-blue-200 hover:dark:text-blue-50'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='mr-2 inline h-5 w-5'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18'
              />
            </svg>
            Back to Search
          </p>
        </Link>
        <h1>Endpoints Debug</h1>

        <p>Http endpoint: {backends.http}</p>
        <p>Socket endpoint: {backends.socket}</p>
      </div>
    </>
  );
}
