import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { io } from 'socket.io-client';
import { titleCase } from 'true-case';

import { departmentNameReplace } from '@/components/departmentNameReplace';

import backends from '@/backends.json';

const columnsshortened: any = {
  de: 'description',
  dep: 'department_name',
  v: 'vendor_name',
  d: 'dollar_amount',
  t: 'transaction_date',
  p: 'program',
  f: 'fund_name',
  id: 'id_number',
  e: 'expenditure_type',
  di: 'detailed_item_description',
  a: 'account_name',
};

const columnsinverseshortened: any = {};

for (const key in columnsshortened) {
  columnsinverseshortened[columnsshortened[key]] = key;
}

const socket = io(backends.socket);

interface transactiontablefilterinterface {
  vendor?: textinterface;
  department?: textinterface;
}

interface textinterface {
  matchtype: string;
  query: string;
}

interface transactiontableinterface {
  filters?: transactiontablefilterinterface;
  optionalcolumns: Array<string>;
  forcescrollmethod?: string;
}

interface requestinterface {
  newresults?: boolean;
}

const columnreadable = {
  transaction_date: 'Date',
  description: 'Description',
  detailed_item_description: 'Item',
  account_name: 'Account',
  vendor_name: 'Vendor',
  department_name: 'Dept',
  fund_name: 'Fund',
  program_name: 'Program',
  expenditure_type: 'Expenditure Type',
};

const desktopnotamountcell =
  'justify-left align-left border-collapse border border-gray-500 px-1 lg:px-2 text-left text-xs lg:text-sm xl:text-base font-normal';

export function TransactionTable(props: transactiontableinterface) {
  const currentShownRows = useRef<Array<any>>([]);
  const [timeelapsed, settimeelapsed] = useState<number>();
  const [firstloaded, setfirstloaded] = useState<boolean>(false);
  const sizeofsearch = useRef<number>(0);
  const router = useRouter();
  const { debugmode } = router.query;
  const firstloadedboolref = useRef<boolean>(false);
  const [sizeofsearchstate, setsizeofsearchstate] = useState<number>(0);
  const currentRows = useRef<Array<any>>([]);
  const currentRowsState = useState<Array<any>>([]);
  const currentLoadedParameters = useRef<any>(null);
  const [currentShownRowsState, setCurrentShownRowsState] = useState<
    Array<any>
  >([]);
  const [socketconnected, setsocketconnected] = useState<boolean>(
    socket.connected
  );
  const [recievedresponse, setrecievedresponse] = useState<boolean>(false);

  const filtersofcurrentlyshowndata = useRef<string>('');

  const socketconnectedref = useRef<boolean>(false);

  const previouslyLoadedFilters = useRef<string>('');

  const numberofloadedrows = useRef<number>(0);

  //executed by new props change or scroll
  function sendReq(requestoptions: requestinterface) {
    //so if it's a trigger for a prop change, trigger a brand new fresh request

    //but if it's a scroll request, send the existing props + the number of loaded rows and say it's a scroll request

    const requestobject: any = {
      filters: props.filters,
      offset: numberofloadedrows.current,
      optionalcolumns: props.optionalcolumns,
      //sortby: transaction_date OR item_description OR detailed_item_description OR vendor OR department
    };

    if (props.forcescrollmethod) {
      if (props.forcescrollmethod != '') {
        requestobject.forcescrollmethod = props.forcescrollmethod;
      }
    }

    console.log('emitting request with', requestobject);
    socket.emit('getcheckbookrows', requestobject);

    fetch(`${backends.http}/fetchrows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestobject),
    })
      .then(async (response) => {
        const jsonresponse = await response.json();

        const cleanedrows = jsonresponse.rows.map((row: any) => {
          const newrow: any = {};

          for (const key in row) {
            newrow[columnsinverseshortened[key]] = row[key];
          }
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    firstloadedboolref.current = true;

    return true;
  }

  //on a new scroll or filter command, the software should determine if it should
  //1. fetch the whole thing or enter infinite scrolling mode via "scrollmode": "infinite" | "all" as a response from the backend
  // a) the front end in infinite mode would store a rows amount and fetch based on the offset number

  socket.on('numberofrowsinreq', (data: any) => {
    if (data.rows) {
      if (data.rows[0]) {
        if (data.rows[0].count) {
          console.log('number of rows in req', parseInt(data.rows[0].count));
          sizeofsearch.current = parseInt(data.rows[0].count);
          setsizeofsearchstate(parseInt(data.rows[0].count));

          if (sizeofsearch.current < 1500) {
            if (sizeofsearch.current > currentShownRows.current.length) {
              // sendReq({ newresults: true });
              console.log('ask for next interation');
            }
          }
        }
      }
    }
  });

  socket.on('recievecheckbookrows', (data: any) => {
    setrecievedresponse(true);
    //process and then update the state
    settimeelapsed(data.timeelapsed);

    let samereq = true;

    if (
      JSON.stringify(data.previouslysetfilters) !==
      filtersofcurrentlyshowndata.current
    ) {
      samereq = false;
    }

    //if it's a new request, then set the current rows to the new rows
    if (data.offsetnumber === 0 || samereq === false) {
      currentShownRows.current = data.rows;
      setCurrentShownRowsState(data.rows);
      numberofloadedrows.current = data.rows.length;
    } else {
      numberofloadedrows.current =
        numberofloadedrows.current + data.rows.length;
      currentShownRows.current = [...currentShownRows.current, data.rows];
      setCurrentShownRowsState(currentShownRows.current);
    }

    filtersofcurrentlyshowndata.current = JSON.stringify(props.filters);
  });

  const loadfirsttime = () => {
    socket.connect();

    if (firstloadedboolref.current === false) {
      sendReq({});
    }
  };

  useEffect(() => {
    if (socketconnectedref.current === true) {
      loadfirsttime();
    }
  });

  useEffect(() => {
    loadfirsttime();

    setInterval(() => {
      loadfirsttime();
    }, 300);

    setInterval(() => {
      if (socket.connected === false) {
        socket.connect();
      }
    }, 200);

    if (typeof window != 'undefined') {
      window.addEventListener('mousemove', (e) => {
        loadfirsttime();
      });
    }
  }, []);

  socket.on('connected', (sendback: any) => {
    socketconnectedref.current = true;
    setsocketconnected(true);
    sendReq({});
  });

  socket.on('disconnect', (sendback: any) => {
    socketconnectedref.current = false;
    setsocketconnected(false);
  });

  socket.connect();

  return (
    <div className='py-1 dark:text-gray-100'>
      {debugmode && (
        <button
          className='rounded bg-blue-800 px-2 py-2 text-white'
          onClick={(e) => {
            sendReq({});
          }}
        >
          Send Req
        </button>
      )}
      {debugmode && (
        <button
          className='rounded bg-purple-800 px-2 py-2 text-white'
          onClick={(e) => {
            socket.connect();
          }}
        >
          Connect Socket
        </button>
      )}
      {firstloadedboolref.current === true && (
        <p>
          <span className='font-semibold'>
            {currentShownRows.current.length}
          </span>{' '}
          of <span className='font-semibold'>{sizeofsearchstate}</span> rows
          loaded.{' '}
          <span>
            {sizeofsearchstate > currentShownRows.current.length && (
              <span>Scroll for more.</span>
            )}
          </span>
        </p>
      )}

      <div className='flex flex-row'>
        <div className='relative my-auto'>
          <div
            className={`x-3 min-x-3 absolute top-auto bottom-auto my-auto ml-2 h-3 shrink-0 animate-ping rounded-full ${
              socketconnected ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{
              width: '12px',
            }}
          ></div>
          <div
            className={`x-3 min-x-3 relative my-auto ml-2 h-3 shrink-0 rounded-full ${
              socketconnected ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{
              width: '12px',
            }}
          ></div>
        </div>
        <p className='mt-auto mb-auto ml-1'>
          {socketconnected ? 'Connected' : 'Connecting...'}
        </p>
      </div>
      {recievedresponse === false && socketconnected && (
        <div className='flex flex-row gap-x-2'>
          <div
            className='x-3 min-x-3 relative my-auto ml-2 h-3 shrink-0 animate-ping rounded-full bg-blue-500'
            style={{
              width: '12px',
            }}
          ></div>
          <p className='text-xs'>Fetching rows...</p>
        </div>
      )}
      <table className='hidden rounded-md px-1 py-1  md:block lg:px-2'>
        <thead>
          <tr className='dark:bg-bruhlessdark'>
            <th>Date</th>
            {props.optionalcolumns.includes('department_name') && <th>Dept</th>}
            {props.optionalcolumns.includes('vendor_name') && <th>Vendor</th>}
            {props.optionalcolumns.includes('fund_name') && <th>Fund</th>}
            {props.optionalcolumns.includes('account_name') && <th>Account</th>}
            {props.optionalcolumns.includes('program') && <th>Program</th>}
            {props.optionalcolumns.includes('expenditure_type') && (
              <th>Expend Type</th>
            )}
            {props.optionalcolumns.includes('description') && <th>Desc</th>}
            {props.optionalcolumns.includes('detailed_item_description') && (
              <th>Detailed Item Desc</th>
            )}
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentShownRows.current.map((eachItem: any) => (
            <tr
              className='font-normal dark:bg-bruhlessdark'
              key={eachItem.id_number}
            >
              <td className='border-collapse border border-gray-500 text-xs font-normal lg:text-sm xl:text-base'>
                {new Date(eachItem.transaction_date).toLocaleDateString(
                  'default',
                  {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                  }
                )}
              </td>
              {props.optionalcolumns.includes('department_name') && (
                <th className={desktopnotamountcell}>
                  <Link
                    href={`/dept/${encodeURIComponent(
                      eachItem.department_name.toLowerCase().trim()
                    )}`}
                  >
                    <span className='underline decoration-sky-500/50 hover:decoration-sky-500'>
                      {titleCase(eachItem.department_name)}
                    </span>
                  </Link>
                </th>
              )}
              {props.optionalcolumns.includes('vendor_name') && (
                <th className={desktopnotamountcell}>
                  <Link
                    href={`/vendors/${encodeURIComponent(
                      eachItem.vendor_name.toLowerCase().trim()
                    )}`}
                  >
                    <span className='underline decoration-sky-500/50 hover:decoration-sky-500'>
                      {titleCase(eachItem.vendor_name)}
                    </span>
                  </Link>
                </th>
              )}
              {props.optionalcolumns.includes('fund_name') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.fund_name)}
                </th>
              )}
              {props.optionalcolumns.includes('account_name') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.account_name)}
                </th>
              )}
              {props.optionalcolumns.includes('program') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.program)}
                </th>
              )}

              {props.optionalcolumns.includes('expenditure_type') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.expenditure_type)}
                </th>
              )}

              {props.optionalcolumns.includes('description') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.description)}
                </th>
              )}
              {props.optionalcolumns.includes('detailed_item_description') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.detailed_item_description)}
                </th>
              )}
              <td className='justify-right align-right border-collapse border border-gray-500 px-1 text-right text-xs tabular-nums  lg:px-2 lg:text-sm xl:text-base'>
                {parseFloat(eachItem.dollar_amount).toLocaleString('default', {
                  style: 'currency',
                  currency: 'USD',
                  currencySign: 'accounting',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='md:hidden'>
        <div className='flex flex-col gap-y-2'>
          {currentShownRows.current.map((eachItem: any) => (
            <div
              className='bg-gray-100 px-2 py-1 dark:bg-gray-800'
              key={eachItem.id_number}
            >
              <div className='flex flex-row'>
                <div className='mr-auto'>
                  <span>
                    {new Date(eachItem.transaction_date).toLocaleDateString(
                      'default',
                      {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                      }
                    )}
                  </span>
                </div>

                <div>
                  <span className='justify-right ml-auto flex-grow font-semibold'>
                    {parseFloat(eachItem.dollar_amount).toLocaleString(
                      'default',
                      {
                        style: 'currency',
                        currency: 'USD',
                        currencySign: 'accounting',
                      }
                    )}
                  </span>
                </div>
              </div>

              {props.optionalcolumns.includes('department_name') &&
                eachItem.department_name && (
                  <p>
                    {' '}
                    <a
                      href={`/vendors/${encodeURIComponent(
                        eachItem.vendor_name.toLowerCase().trim()
                      )}`}
                    >
                      <span className='underline decoration-sky-500/80 hover:decoration-sky-500'>
                        {departmentNameReplace(eachItem.department_name)}
                      </span>
                    </a>
                  </p>
                )}

              {props.optionalcolumns.includes('vendor_name') &&
                eachItem.vendor_name && (
                  <p>
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Vendor:{' '}
                      </span>
                      <Link
                        href={`/vendors/${encodeURIComponent(
                          eachItem.vendor_name.toLowerCase().trim()
                        )}`}
                      >
                        <span className='underline decoration-sky-500/80 hover:decoration-sky-500'>
                          {titleCase(eachItem.vendor_name)}
                        </span>
                      </Link>
                    </span>
                  </p>
                )}

              {props.optionalcolumns.includes('fund_name') && eachItem.program && (
                <p>
                  <span className=''>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Fund:{' '}
                    </span>
                    {titleCase(eachItem.fund_name)}
                  </span>
                </p>
              )}
              {props.optionalcolumns.includes('account_name') &&
                eachItem.program && (
                  <p>
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Fund:{' '}
                      </span>
                      {titleCase(eachItem.account_name)}
                    </span>
                  </p>
                )}

              {props.optionalcolumns.includes('program') &&
                eachItem['program'] && (
                  <p>
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Program:{' '}
                      </span>
                      {titleCase(eachItem.program)}
                    </span>
                  </p>
                )}

              {props.optionalcolumns.includes('expenditure_type') &&
                eachItem['expenditure_type'] && (
                  <p>
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Expenditure Type:{' '}
                      </span>
                      {titleCase(eachItem.expenditure_type)}
                    </span>{' '}
                  </p>
                )}

              {props.optionalcolumns.includes('description') &&
                eachItem.description && (
                  <p>
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Desc:{' '}
                      </span>
                      {titleCase(eachItem.description)}
                    </span>
                  </p>
                )}

              {props.optionalcolumns.includes('detailed_item_description') &&
                eachItem['detailed_item_description'] && (
                  <p>
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Item:{' '}
                      </span>
                      <span>
                        {titleCase(eachItem.detailed_item_description)}
                      </span>
                    </span>
                  </p>
                )}
            </div>
          ))}
        </div>
      </div>
      {firstloadedboolref.current === true &&
        sizeofsearchstate === currentShownRows.current.length && (
          <p className='my-1 font-semibold'>
            All rows loaded. Nothing past this!
          </p>
        )}
    </div>
  );
}
