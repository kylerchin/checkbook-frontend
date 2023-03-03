import { mdiIncognitoCircle } from '@mdi/js';
import Icon from '@mdi/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { io } from 'socket.io-client';
import { titleCase } from 'true-case';

import { departmentNameReplace } from '@/components/departmentNameReplace';
import { simpleHash } from '@/components/simpleHash';
import { vendorNameReplace } from '@/components/vendorNameReplace';

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
  q: 'quantity',
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
  forcescrollmethod?: string;
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
  'max-w-[200px] xl:max-w-xs 2xl:max-w-auto justify-left align-left border-collapse border border-gray-500 px-0.5 lg:px-1 text-left text-xs lg:text-sm xl:text-base font-normal';

interface vendorelementinterface {
  vendor_name: string;
}

export function VendorElement(props: vendorelementinterface) {
  return (
    <>
      {props.vendor_name.match(/privacy-/gi) && (
        <>
          <Icon
            className='inline align-middle  text-gray-600 dark:text-gray-400'
            path={mdiIncognitoCircle}
            size={1}
          />
          <span className='ml-1 text-gray-700 dark:text-gray-300'>
            Privacy-
          </span>
        </>
      )}
      {vendorNameReplace(props.vendor_name)}
    </>
  );
}

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

  const ticking = useRef(false);
  const lastKnownScrollPosition = useRef(0);

  const [socketconnected, setsocketconnected] = useState<boolean>(
    socket.connected
  );
  const [recievedresponse, setrecievedresponse] = useState<boolean>(false);

  const filtersofcurrentlyshowndata = useRef<string>('');

  const socketconnectedref = useRef<boolean>(false);

  const sizeOfSearchObj = useRef<any>(null);

  const previouslyLoadedFilters = useRef<string>('');

  const numberofloadedrows = useRef<number>(0);

  const currentlySetFilterHash = useRef<string>('');

  const lastRefBuffer70 = useRef(null);
  const lastRefMobileBuffer15 = useRef(null);
  const lastRefMobile = useRef(null);
  const lastRefSecondLast = useRef(null);
  const lastRef = useRef(null);

  function isInViewport(element: any, buffer: any) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight + buffer ||
          document.documentElement.clientHeight + buffer) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  //executed by new props change or scroll
  function sendReq(requestoptions: requestinterface) {
    //so if it's a trigger for a prop change, trigger a brand new fresh request

    //but if it's a scroll request, send the existing props + the number of loaded rows and say it's a scroll request

    const thisRequestFilters = JSON.stringify(props.filters);
    const thisRequestOptionalColumns = JSON.stringify(props.optionalcolumns);
    const thisRequestOffset = numberofloadedrows.current;

    const reqFilterHash = simpleHash(thisRequestFilters);

    const requestobject: any = {
      filters: props.filters,
      offset: numberofloadedrows.current,
      optionalcolumns: props.optionalcolumns,
      //sortby: transaction_date OR item_description OR detailed_item_description OR vendor OR department
    };

    if (requestoptions.forcescrollmethod) {
      requestobject.forcescrollmethod = requestoptions.forcescrollmethod;
    } else {
      if (props.forcescrollmethod) {
        if (props.forcescrollmethod != '') {
          requestobject.forcescrollmethod = props.forcescrollmethod;
        }
      }
    }

    console.log('emitting request with', requestobject);
    //socket.emit('getcheckbookrows', requestobject);

    let cancelcountrows = false;

    if (sizeOfSearchObj.current) {
      if (
        sizeOfSearchObj.current.filterhash == simpleHash(thisRequestFilters)
      ) {
        cancelcountrows = true;
      }
    }

    if (cancelcountrows === false) {
      fetch(`${backends.http}/countrows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestobject),
      })
        .then(async (response) => {
          const jsonresponse = await response.json();

          console.log('jsonresponse', jsonresponse);

          if (jsonresponse.rows) {
            if (jsonresponse.rows[0]) {
              if (jsonresponse.rows[0].count) {
                console.log(
                  'number of rows in req',
                  parseInt(jsonresponse.rows[0].count)
                );
                sizeofsearch.current = parseInt(jsonresponse.rows[0].count);
                setsizeofsearchstate(parseInt(jsonresponse.rows[0].count));

                sizeOfSearchObj.current = {
                  filterhash: reqFilterHash,
                  size: sizeofsearch.current,
                };

                if (sizeofsearch.current < 3000) {
                  if (sizeofsearch.current > currentShownRows.current.length) {
                    // sendReq({});
                    //console.log('ask for next interation');
                  }
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    fetch(`${backends.http}/fetchrows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestobject),
    })
      .then(async (response) => {
        const jsonresponse = await response.json();

        if (jsonresponse.rows) {
          const cleanedrows = jsonresponse.rows.map((row: any) => {
            const newrow: any = {};

            //this section cleans up the column names from the shortened column names used for network compression

            for (const key in row) {
              if (columnsshortened[key]) {
                newrow[columnsshortened[key]] = row[key];
              } else {
                newrow[key] = row[key];
              }
            }

            //this section adds the duplicate columns to the row

            if (jsonresponse.dupallrows) {
              for (const columnnamedup in jsonresponse.dupallrows) {
                newrow[columnsshortened[columnnamedup]] =
                  jsonresponse.dupallrows[columnnamedup];
              }
            }

            return newrow;
          });

          console.log('cleanedrows', cleanedrows);

          setrecievedresponse(true);
          //process and then update the state
          settimeelapsed(jsonresponse.timeelapsed);

          let samereq = true;

          const data = jsonresponse;

          //cancel the response if the currently shown filters / sort (filtersofcurrentlyshowndata) match the requested filters (which is contained in props) and this response doesn't match the requested filters

          let cancel = false;

          //check if currently shown filters match the prop requested filters
          if (
            JSON.stringify(props.filters) ===
            filtersofcurrentlyshowndata.current
          ) {
            //is this filter different than the currently requested + already loaded filters
            if (filtersofcurrentlyshowndata.current !== thisRequestFilters) {
              cancel = true;
            }
          }

          if (cancel === false) {
            if (reqFilterHash !== currentlySetFilterHash.current) {
              samereq = false;
              console.log('different request');
            }

            //if it's a new request, then set the current rows to the new rows

            if (data.offsetnumber === 0 || samereq === false) {
              if (data.offsetnumber === 0) {
                currentShownRows.current = cleanedrows;
                setCurrentShownRowsState(cleanedrows);
                numberofloadedrows.current = cleanedrows.length;
              }
            } else {
              if (data.offsetnumber === numberofloadedrows.current) {
                console.log(
                  'numberofloadedrows.current',
                  numberofloadedrows.current
                );
                console.log('cleanedrows.length', cleanedrows.length);
                numberofloadedrows.current =
                  numberofloadedrows.current + cleanedrows.length;
                currentShownRows.current = [
                  ...currentShownRows.current,
                  ...cleanedrows,
                ];
                setCurrentShownRowsState(currentShownRows.current);
              } else {
                console.log('offset incorrect');
                console.log(
                  'currently showing',
                  numberofloadedrows.current,
                  'offset response',
                  data.offsetnumber
                );
              }
            }

            filtersofcurrentlyshowndata.current = thisRequestFilters;
            currentlySetFilterHash.current = reqFilterHash;

            if (
              sizeofsearch.current < 3000 ||
              currentShownRows.current.length < 1001
            ) {
              if (sizeofsearch.current > currentShownRows.current.length) {
                console.log('asking for next interation');

                if (sizeOfSearchObj.current) {
                  if (
                    sizeOfSearchObj.current.filterhash == reqFilterHash &&
                    sizeofsearch.current < 3000
                  ) {
                    sendReq({ forcescrollmethod: 'all' });
                  } else {
                    sendReq({});
                  }
                }
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    firstloadedboolref.current = true;

    return true;
  }

  const checkIfLoadMore = () => {
    let loadMore = false;

    let actOn = [];

    if (window.innerWidth >= 768) {
      actOn = [lastRef.current, lastRefBuffer70.current];
    } else {
      actOn = [lastRefMobile.current, lastRefMobileBuffer15.current];
    }

    actOn.forEach((eachItem) => {
      if (eachItem) {
        if (isInViewport(eachItem, 100)) {
          loadMore = true;
        }
      }
    });

    if (loadMore) {
      if (currentShownRows.current.length < sizeofsearch.current) {
        sendReq({});
      }
    }
  };

  const setLastObjRefMobile = (ref: any, index: number, length: number) => {
    if (length - 1 === index) {
      lastRefMobile.current = ref;
    }

    if (length - 15 === index) {
      lastRefMobileBuffer15.current = ref;
    }
  };

  const setLastObjRef = (ref: any, index: number, length: number) => {
    if (length > 70) {
      if (length - 71 === index) {
        lastRefBuffer70.current = ref;
      }
    }

    if (length - 1 === index) {
      lastRef.current = ref;
    }

    if (length - 2 === index) {
      lastRefSecondLast.current = ref;
    }
  };

  //on a new scroll or filter command, the software should determine if it should
  //1. fetch the whole thing or enter infinite scrolling mode via "scrollmode": "infinite" | "all" as a response from the backend
  // a) the front end in infinite mode would store a rows amount and fetch based on the offset number

  const loadfirsttime = () => {
    // socket.connect();

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

  // socket.connect();

  return (
    <div className='relative py-1 dark:text-gray-100'>
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
        <div className='sticky top-[48px] z-10 bg-white align-top  dark:bg-bruhdark md:top-[50px]'>
          <p className='ml-2'>
            <span className='font-semibold'>
              {currentShownRows.current.length.toLocaleString('default')}
            </span>{' '}
            of{' '}
            <span className='font-semibold'>
              {sizeofsearchstate.toLocaleString('default')}
            </span>{' '}
            rows loaded.{' '}
            <span>
              {sizeofsearchstate > currentShownRows.current.length && (
                <span>Scroll for more.</span>
              )}
            </span>
          </p>
        </div>
      )}

      {false && (
        <>
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
        </>
      )}

      {recievedresponse === false && (
        <div className='flex flex-row gap-x-2'>
          <svg
            aria-hidden='true'
            className='mr-2 h-8 w-8 animate-spin fill-sky-500 text-gray-200 dark:text-gray-600'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
              fill='currentColor'
            />
            <path
              d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
              fill='currentFill'
            />
          </svg>
          <p className='text-lg font-semibold'>Fetching rows</p>
        </div>
      )}
      <table
        className={`hidden rounded-md px-1 py-1  ${
          recievedresponse === true ? 'md:block' : ''
        } lg:px-2`}
      >
        <thead>
          <tr className=' text-xs dark:bg-bruhlessdark lg:text-sm xl:text-lg'>
            <th className=''>Date</th>
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
              <th>Item</th>
            )}
            {props.optionalcolumns.includes('quantity') && <th>Qty</th>}
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentShownRows.current.map((eachItem: any, index) => (
            <tr
              className='font-normal dark:bg-bruhlessdark'
              key={eachItem.id_number}
              ref={(ref) => {
                setLastObjRef(ref, index, currentShownRows.current.length);
              }}
            >
              <td className='border-collapse border border-gray-500 text-xs font-normal lg:text-sm xl:text-base'>
                {new Date(eachItem.transaction_date).toLocaleDateString(
                  'default',
                  {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'America/Los_Angeles',
                  }
                )}
              </td>
              {props.optionalcolumns.includes('department_name') && (
                <th className={desktopnotamountcell}>
                  {eachItem.department_name && (
                    <Link
                      href={`/dept/${encodeURIComponent(
                        eachItem.department_name.toLowerCase().trim()
                      )}`}
                    >
                      <span className='underline decoration-sky-600/80 hover:decoration-sky-500'>
                        {departmentNameReplace(eachItem.department_name)}
                      </span>
                    </Link>
                  )}
                </th>
              )}
              {props.optionalcolumns.includes('vendor_name') && (
                <th className={desktopnotamountcell}>
                  {eachItem.vendor_name && (
                    <Link
                      href={`/vendors/${encodeURIComponent(
                        eachItem.vendor_name.toLowerCase().trim()
                      )}`}
                    >
                      <span className='underline decoration-sky-600/80 hover:decoration-sky-500'>
                        <VendorElement vendor_name={eachItem.vendor_name} />
                      </span>
                    </Link>
                  )}
                </th>
              )}
              {props.optionalcolumns.includes('fund_name') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.fund_name).replace(/ and /gi, ' & ')}
                </th>
              )}
              {props.optionalcolumns.includes('account_name') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.account_name).replace(/ and /gi, ' & ')}
                </th>
              )}
              {props.optionalcolumns.includes('program') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.program).replace(/ and /gi, ' & ')}
                </th>
              )}

              {props.optionalcolumns.includes('expenditure_type') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.expenditure_type).replace(
                    / and /gi,
                    ' & '
                  )}
                </th>
              )}

              {props.optionalcolumns.includes('description') && (
                <th className={`${desktopnotamountcell} break-all`}>
                  {titleCase(eachItem.description)}
                </th>
              )}
              {props.optionalcolumns.includes('detailed_item_description') && (
                <th className={`${desktopnotamountcell} break-all`}>
                  {titleCase(eachItem.detailed_item_description)}
                </th>
              )}

              {props.optionalcolumns.includes('quantity') && (
                <th className='justify-right align-right  border-collapse border border-gray-500 px-0.5 text-right text-xs font-normal tabular-nums lg:px-1 lg:text-sm xl:text-base'>
                  {Number(eachItem.quantity) != 0 && eachItem.quantity}
                </th>
              )}
              <td className='justify-right align-right border-collapse border border-gray-500 px-1 text-right text-xs tabular-nums  lg:px-2 lg:text-sm xl:text-base'>
                {parseFloat(eachItem.dollar_amount)
                  .toLocaleString('default', {
                    style: 'currency',
                    currency: 'USD',
                    currencySign: 'accounting',
                  })
                  .replace(/us/gi, '')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='md:hidden'>
        <div className='flex flex-col gap-y-2'>
          {currentShownRows.current.map((eachItem: any, index: number) => (
            <div
              className='overflow-x-hidden rounded-sm bg-gray-200 px-2 py-1 dark:bg-gray-900'
              key={eachItem.id_number}
              ref={(ref) => {
                setLastObjRefMobile(ref, index, currentRows.current.length);
              }}
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
                    {parseFloat(eachItem.dollar_amount)
                      .toLocaleString('default', {
                        style: 'currency',
                        currency: 'USD',
                        currencySign: 'accounting',
                      })
                      .replace(/us/gi, '')}
                  </span>
                </div>
              </div>

              {props.optionalcolumns.includes('department_name') &&
                eachItem.department_name && (
                  <p>
                    <a
                      href={`/dept/${encodeURIComponent(
                        eachItem.department_name.toLowerCase().trim()
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
                          <VendorElement vendor_name={eachItem.vendor_name} />
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
                        Account:{' '}
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
                    <span className='break-words'>
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
                    <span className='break-words'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Item:{' '}
                      </span>
                      <span>
                        {titleCase(eachItem.detailed_item_description)}
                      </span>
                    </span>
                    {eachItem['quantity'] && Number(eachItem['quantity']) != 0 && (
                      <span className='break-words'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          {' '}
                          Qty:{' '}
                        </span>
                        <span>
                          {Number(eachItem.quantity).toLocaleString('default')}
                        </span>
                      </span>
                    )}
                  </p>
                )}

              {props.optionalcolumns.includes('quantity') &&
                !(
                  eachItem['detailed_item_description'] &&
                  props.optionalcolumns.includes('detailed_item_description')
                ) &&
                eachItem['quantity'] &&
                Number(eachItem['quantity']) != 0 && (
                  <p>
                    <span className='break-words'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Qty:{' '}
                      </span>
                      <span>
                        {Number(eachItem.quantity).toLocaleString('default')}
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
          <p className='my-1 ml-2 font-semibold'>
            All rows loaded. Nothing past this!
          </p>
        )}
    </div>
  );
}
