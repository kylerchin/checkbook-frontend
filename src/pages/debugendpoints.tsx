import byteSize from 'byte-size';
import Link from 'next/link';
import * as React from 'react';
import { useEffect } from 'react';

import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';

import backends from '@/backends.json';

export default function Departments(props: any): JSX.Element {
  // Render data...

  const [checkbookdata, setCheckbookdata] = React.useState<any>(null);

  useEffect(() => {
    fetch('https://djkensterprod.lacontroller.io/fetchcheckbookmetaraw')
      .then((response) => response.json())
      .then((data) => {
        console.log('checkbookdata', data);
        setCheckbookdata(data);
      });
  }, []);

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
        <br />
        {checkbookdata ? (
          <>
            <p>
              Rows:{' '}
              <span className='font-semibold tabular-nums'>
                {parseInt(
                  checkbookdata.checkbookrowsize[0].count
                ).toLocaleString('default')}
              </span>
            </p>
            <p>
              File Size in Bytes:{' '}
              <span className='font-semibold tabular-nums'>
                {parseInt(
                  checkbookdata.checkbooklastupdated[0].filesize
                ).toLocaleString('default')}
              </span>
            </p>
            <p>
              File Size Shortened:{' '}
              <span className='font-semibold tabular-nums'>
                {
                  byteSize(
                    parseInt(checkbookdata.checkbooklastupdated[0].filesize)
                  ).value
                }
                {
                  byteSize(
                    parseInt(checkbookdata.checkbooklastupdated[0].filesize)
                  ).unit
                }
              </span>
            </p>
            <p>
              Time of File Download from Socrata:{' '}
              <span className='font-semibold'>
                {new Date(
                  checkbookdata.checkbooklastupdated[0].timeoffiledownload
                ).toLocaleString('default')}
              </span>
            </p>
            <p>
              Time of File Upload to Postgres:{' '}
              <span className='font-semibold'>
                {new Date(
                  checkbookdata.checkbooklastupdated[0].lastuploaded
                ).toLocaleString('default')}
              </span>
            </p>
            {checkbookdata.checkbooklastupdated[0].lastindexed ? (
              <p>
                Time of Last Index:{' '}
                <span className='font-semibold'>
                  {new Date(
                    checkbookdata.checkbooklastupdated[0].lastindexed
                  ).toLocaleString('default')}
                </span>
              </p>
            ) : (
              <p>Indexing not yet completed...</p>
            )}
          </>
        ) : (
          <p>Checkbook Data not fetched yet...</p>
        )}
      </div>
    </>
  );
}
