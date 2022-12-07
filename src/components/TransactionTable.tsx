import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { io } from 'socket.io-client';

const socket = io('https://api.checkbook.mejiaforcontroller.com/');

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

  //on a new scroll or filter command, the software should determine if it should
  //1. fetch the whole thing or enter infinite scrolling mode via "scrollmode": "infinite" | "all" as a response from the backend
  // a) the front end in infinite mode would store a rows amount and fetch based on the offset number

  socket.on('gettrans', (data: any) => {
    //process and then update the state
    settimeelapsed(data.timeelapsed);
  });

  useEffect(() => {
    sendReq({
      newresults: true,
    });
  }, []);

  //executed by new props change or scroll
  const sendReq = (requestoptions: requestinterface) => {
    //so if it's a trigger for a prop change, trigger a brand new fresh request

    //but if it's a scroll request, send the existing props + the number of loaded rows and say it's a scroll request

    const requestobject: any = {
      columnstoshow: [
        'department_name',
        'fund_name',
        'program_name',
        'expenditure_type',
        'description',
        'detailed_description',
        'dollar_amount',
        'transaction_date',
      ],
      filter: {},
      //sortby: transaction_date OR item_description OR detailed_item_description OR vendor OR department
    };

    if (props.filter) {
      if (props.filter.vendor) {
        requestobject.filter.vendor = props.filter.vendor;
      }
    }

    socket.emit('reqtrans', requestobject);

    return true;
  };

  return (
    <table>
      <thead>
        <tr></tr>
      </thead>
      <tbody>
        {currentShownRows.current.map((eachItem: any) => (
          <tr key={eachItem.id_number}>
            <td></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
