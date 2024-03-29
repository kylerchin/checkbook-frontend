import { mdiIncognitoCircle } from '@mdi/js';
import Icon from '@mdi/react';
import * as React from 'react';
import { useEffect } from 'react';
import { titleCase } from 'true-case';

import { BackToSearch } from '@/components/backtosearch';
import { departmentNameReplace } from '@/components/departmentNameReplace';
import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';
import { TransactionTable } from '@/components/TransactionTable';
import { vendorNameReplace } from '@/components/vendorNameReplace';

import backends from '@/backends.json';
export default function Vendors(props: any) {
  // Render data...

  useEffect(() => {
    console.log(props.data.totalcost);
  });

  useEffect(() => {
    async () => {
      const inputobjectpermonth = {
        params: {
          vendor: props.vendorname,
        },
      };

      fetch(`${backends.http}/vendortransactionsovertimedeptpermonth/`, {
        method: 'POST',
        body: JSON.stringify(inputobjectpermonth),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };
  }, []);

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='relative mx-auto dark:text-gray-100 '>
        <Seo
          title={`${titleCase(
            props.data.totalcost[0].vendor_name
          )}|LA Checkbook Vendor`}
        />

        <BackToSearch />

        <h1 className='ml-2'>
          <>
            {props.data.totalcost[0].vendor_name.match(/privacy-/gi) && (
              <>
                <Icon
                  className='inline align-middle  text-gray-600 dark:text-gray-400'
                  path={mdiIncognitoCircle}
                  size={2}
                />
                <span className='ml-1 text-gray-600 dark:text-gray-400'>
                  Privacy-
                </span>
              </>
            )}
          </>
          {vendorNameReplace(props.data.totalcost[0].vendor_name)}
        </h1>
        <h4 className='ml-2'>Vendor</h4>
        <p className='ml-2 lg:text-lg'>
          {'Since 2014, '}
          {parseInt(props.data.totalcost[0].count).toLocaleString(
            'default'
          )}{' '}
          transactions totaling{' '}
          <span className='font-semibold'>
            {parseFloat(props.data.totalcost[0].sum).toLocaleString('default', {
              style: 'currency',
              currency: 'USD',
            })}
          </span>
        </p>
        {props.data.thisyearsum && props.data.thisyearsum[0] ? (
          <p className='ml-2 lg:text-lg'>
            In 2023,{' '}
            {parseInt(props.data.thisyearsum[0].count).toLocaleString(
              'default'
            )}{' '}
            transactions totaling{' '}
            <span className='font-semibold'>
              {parseFloat(props.data.thisyearsum[0].sum).toLocaleString(
                'default',
                {
                  style: 'currency',
                  currency: 'USD',
                }
              )}
            </span>
          </p>
        ) : (
          <p className='ml-2 lg:text-lg'>No Transactions in 2023</p>
        )}

        {props.data.totalcost[0].vendor_name.match(/privacy-/gi) && (
          <p className='ml-2 leading-tight text-purple-800 dark:text-purple-300'>
            This Vendor Page is the list of Transactions for the{' '}
            <span className='font-bold'>
              {departmentNameReplace(
                vendorNameReplace(props.data.totalcost[0].vendor_name)
              )}
            </span>{' '}
            Department where the vendor was not disclosed.
          </p>
        )}

        {false && (
          <p className='text-sm'>
            Loaded in {props.data.timeelapsed.toFixed(1)}ms
          </p>
        )}
        <div className='ml-2 flex flex-row gap-x-1'>
          <div className='rounded-full bg-black px-2 py-1 text-white dark:border dark:border-gray-500'>
            Summary
          </div>
          <div className='rounded-full border border-black bg-white px-2 py-1 text-black'>
            Table
          </div>
        </div>

        <div className='relative'>
          <TransactionTable
            optionalcolumns={[
              'department_name',
              'fund_name',
              'account_name',
              'program',
              'expenditure_type',
              'description',
              'detailed_item_description',
              'quantity',
            ]}
            filters={{
              vendor: {
                query: props.vendorname,
                matchtype: 'equals',
              },
            }}
          />
        </div>

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
    </>
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

  const res = await fetch(`${backends.http}/vendorpage/`, {
    method: 'POST',
    body: JSON.stringify(inputobject),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();

  console.log('data came back');
  console.log(data);

  // Pass data to the page via props
  return {
    props: {
      data: data,
      vendorname: context.params.vendor,
    },
  };
}
