import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { io } from 'socket.io-client';

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
  filter?: transactiontablefilterinterface;
}

interface requestinterface {
  newresults?: boolean;
}
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

  const socketconnectedref = useRef<boolean>(false);

  const previouslyLoadedFilters = useRef<string>('');

  const numberofloadedrows = useRef<number>(0);

  //executed by new props change or scroll
  function sendReq(requestoptions: requestinterface) {
    //so if it's a trigger for a prop change, trigger a brand new fresh request

    //but if it's a scroll request, send the existing props + the number of loaded rows and say it's a scroll request

    const requestobject: any = {
      filter: props.filter,
      offset: numberofloadedrows.current,
      //sortby: transaction_date OR item_description OR detailed_item_description OR vendor OR department
    };

    console.log('emitting request with', requestobject);
    socket.emit('getcheckbookrows', requestobject);

    return true;
  }

  //on a new scroll or filter command, the software should determine if it should
  //1. fetch the whole thing or enter infinite scrolling mode via "scrollmode": "infinite" | "all" as a response from the backend
  // a) the front end in infinite mode would store a rows amount and fetch based on the offset number

  socket.on('recievecheckbookrows', (data: any) => {
    //process and then update the state
    settimeelapsed(data.timeelapsed);

    let samereq = true;

    if (props.filter) {
      if (props.filter.vendor) {
        if (
          props.filter.vendor.query !== data.reqargs.filter.vendor.query &&
          props.filter.vendor.matchtype !== data.reqargs.filter.vendor.matchtype
        ) {
          samereq = false;
        }
      }
    }

    //if it's a new request, then set the current rows to the new rows
    if (samereq === false) {
      currentShownRows.current = data.rows;
      setCurrentShownRowsState(data.rows);
      numberofloadedrows.current = data.rows.length;
    } else {
      numberofloadedrows.current =
        numberofloadedrows.current + data.rows.length;
    }
  });

  useEffect(() => {
    if (socketconnectedref.current === true) {
      if (JSON.stringify(props.filter) === previouslyLoadedFilters.current) {
        //do nothing
      } else {
        previouslyLoadedFilters.current = JSON.stringify(props.filter);
        sendReq({});
      }
    }
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
      <button
        className='rounded bg-blue-800 px-2 py-2 text-white'
        onClick={(e) => {
          sendReq({});
        }}
      >
        Send Req
      </button>
      <table>
        <thead>
          <tr>
            <th>Dept</th>
            <th>Date</th>
            <th>Desc</th>
            <th>Detailed Desc</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentShownRows.current.map((eachItem: any) => (
            <tr key={eachItem.id_number}>
              <td>{eachItem.department_name}</td>
              <td>{eachItem.transaction_date}</td>
              <td>{eachItem.description}</td>
              <td>{eachItem.detailed_item_description}</td>
              <td className='tabular-nums'>{eachItem.dollar_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
