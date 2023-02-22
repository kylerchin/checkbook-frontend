import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { io } from 'socket.io-client';
import { titleCase } from 'true-case';

import backends from '@/backends.json';

const socket = io(backends.socket);

interface transactiontablefilterinterface {
  vendor?: textinterface;
}

interface textinterface {
  matchtype: string;
  query: string;
}

interface transactiontableinterface {
  filters?: transactiontablefilterinterface;
  optionalcolumns: Array<string>;
}

interface requestinterface {
  newresults?: boolean;
}

const columnreadable = {
  transaction_date: 'Date',
  description: 'Description',
  detailed_item_description: 'Item',
  vendor_name: 'Vendor',
  department_name: 'Dept',
  fund_name: 'Fund',
  program_name: 'Program',
  expenditure_type: 'Expenditure Type',
};

const desktopnotamountcell =
  'justify-left align-left border-collapse border border-gray-500 px-2 text-left  font-normal';

export function TransactionTable(props: transactiontableinterface) {
  const currentShownRows = useRef<Array<any>>([]);
  const [timeelapsed, settimeelapsed] = useState<number>();
  const [firstloaded, setfirstloaded] = useState<boolean>(false);
  const firstloadedboolref = useRef<boolean>(false);
  const currentRows = useRef<Array<any>>([]);
  const currentRowsState = useState<Array<any>>([]);
  const currentLoadedParameters = useRef<any>(null);
  const [currentShownRowsState, setCurrentShownRowsState] = useState<
    Array<any>
  >([]);

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
      //sortby: transaction_date OR item_description OR detailed_item_description OR vendor OR department
    };

    console.log('emitting request with', requestobject);
    socket.emit('getcheckbookrows', requestobject);

    firstloadedboolref.current = true;

    return true;
  }

  //on a new scroll or filter command, the software should determine if it should
  //1. fetch the whole thing or enter infinite scrolling mode via "scrollmode": "infinite" | "all" as a response from the backend
  // a) the front end in infinite mode would store a rows amount and fetch based on the offset number

  socket.on('recievecheckbookrows', (data: any) => {
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

  useEffect(() => {
    if (socketconnectedref.current === true) {
      if (firstloadedboolref.current === true) {
        //do nothing
      } else {
        sendReq({});
      }
    }

    setInterval(() => {
      socket.connect();

      if (firstloadedboolref.current === true) {
        //do nothing
      } else {
        sendReq({});
      }
    }, 300);
  });

  socket.on('connected', (sendback: any) => {
    socketconnectedref.current = true;
    sendReq({});
  });

  socket.on('disconnect', (sendback: any) => {
    socketconnectedref.current = false;
  });

  socket.connect();

  return (
    <div>
      {false && (
        <button
          className='rounded bg-blue-800 px-2 py-2 text-white'
          onClick={(e) => {
            sendReq({});
          }}
        >
          Send Req
        </button>
      )}
      <table className='hidden md:block'>
        <thead>
          <tr>
            <th>Date</th>
            {props.optionalcolumns.includes('department_name') && <th>Dept</th>}
            {props.optionalcolumns.includes('vendor_name') && <th>Vendor</th>}
            {props.optionalcolumns.includes('fund_name') && <th>Fund</th>}
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
            <tr className='font-normal' key={eachItem.id_number}>
              <td className='border-collapse border border-gray-500 font-normal'>
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
                  {titleCase(eachItem.department_name)}
                </th>
              )}
              {props.optionalcolumns.includes('vendor_name') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.vendor_name)}
                </th>
              )}
              {props.optionalcolumns.includes('fund_name') && (
                <th className={desktopnotamountcell}>
                  {titleCase(eachItem.fund_name)}
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
              <td className='justify-right align-right border-collapse border border-gray-500 px-2 text-right tabular-nums'>
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
            <div className='bg-gray-800 px-2 py-1' key={eachItem.id_number}>
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
              <p>
                {props.optionalcolumns.includes('department_name') &&
                  eachItem.department_name && (
                    <span className=''>
                      {titleCase(eachItem.department_name)}
                    </span>
                  )}
              </p>
              <p>
                {props.optionalcolumns.includes('vendor_name') &&
                  eachItem.vendor_name && (
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Vendor:{' '}
                      </span>
                      {titleCase(eachItem.vendor_name)}
                    </span>
                  )}
              </p>
              <p>
                {props.optionalcolumns.includes('fund_name') &&
                  eachItem.program && (
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Fund:{' '}
                      </span>
                      {titleCase(eachItem.fund_name)}
                    </span>
                  )}
              </p>
              <p>
                {props.optionalcolumns.includes('program') &&
                  eachItem['program'] && (
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Program:{' '}
                      </span>
                      {titleCase(eachItem.program)}
                    </span>
                  )}
              </p>
              <p>
                {props.optionalcolumns.includes('expenditure_type') &&
                  eachItem['expenditure_type'] && (
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Expenditure Type:{' '}
                      </span>
                      {titleCase(eachItem.expenditure_type)}
                    </span>
                  )}
              </p>
              <p>
                {props.optionalcolumns.includes('description') &&
                  eachItem.description && (
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Desc:{' '}
                      </span>
                      {titleCase(eachItem.description)}
                    </span>
                  )}
              </p>
              <p>
                {props.optionalcolumns.includes('detailed_item_description') &&
                  eachItem['detailed_item_description'] && (
                    <span className=''>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Item:{' '}
                      </span>
                      <span>
                        {titleCase(eachItem.detailed_item_description)}
                      </span>
                    </span>
                  )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
