import Link from 'next/link';
import * as React from 'react';
import { useEffect } from 'react';
import { titleCase } from 'true-case';

import Seo from '@/components/Seo';
export default function Vendors(props: any) {
  // Render data...

  useEffect(() => {
    console.log(props.data.totalcost);
  });

  return (
    <div className='container mx-auto mx-2 mt-4 dark:text-gray-100'>
      <Seo
        title={`${titleCase(
          props.data.totalcost[0].vendor_name
        )}|LA Checkbook Vendor`}
      />
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
      <h1>{titleCase(props.data.totalcost[0].vendor_name)}</h1>
      <p className='text-lg'>
        {'Since 2014, '}
        {parseInt(props.data.totalnumberoftransactions[0].count)} transactions
        totaling{' '}
        <span className='font-semibold'>
          ${parseInt(props.data.totalcost[0].sum).toLocaleString('en-US')}
        </span>
      </p>
      {props.data.thisyearsum && props.data.thisyearsum[0] ? (
        <p className='text-lg'>
          In 2022, {parseInt(props.data.thisyearsum[0].count)} transactions
          totaling{' '}
          <span className='font-semibold'>
            ${parseInt(props.data.thisyearsum[0].sum).toLocaleString('en-US')}
          </span>
        </p>
      ) : (
        <p className='text-lg'>No Transactions in 2022</p>
      )}
      <p className='text-sm'>Loaded in {props.data.timeelapsed.toFixed(1)}ms</p>

      {/*

        <div className='rounded-sm bg-gray-100 py-3 px-2'>
        <h3>Spending over time</h3>
        <div className='flex  flex-row overflow-x-scroll'>
          <div
            className={`
            mx-1 mb-8 flex h-32 flex-col
             align-bottom lg:h-64`}
          >
            <p>$12B</p>
          </div>
          {[
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
          ].map((e, i) => (
            <div
              key={i}
              className={`mt-10 mb-8 flex h-32 flex-col rounded-lg align-bottom
             lg:h-64 ${i > 0 ? ` ml-1` : ``}`}
            >
              {i % 10 === 0 ? (
                <div className='px-1'></div>
              ) : (
                <>
                  <div
                    className='mt-auto rounded-t-full bg-blue-500 px-1 '
                    style={{
                      height: i % 5 === 0 ? `20%` : `50%`,
                    }}
                  ></div>
                  <div
                    className='rounded-b-full bg-green-500 px-1 '
                    style={{
                      height: i % 3 === 0 ? `10%` : `90%`,
                    }}
                  ></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

        */}
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  // Fetch data from external API

  const inputobject = {
    params: {
      vendor: context.params.vendor,
    },
  };

  const res = await fetch(
    `https://djkenster.checkbook.mejiaforcontroller.com/vendorpage/`,
    {
      method: 'POST',
      body: JSON.stringify(inputobject),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await res.json();

  console.log('data came back');
  console.log(data);

  // Pass data to the page via props
  return {
    props: {
      data: data,
    },
  };
}
