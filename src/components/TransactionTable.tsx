import { useRef, useState } from 'react';
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

export function TransactionTable(props: transactiontableinterface) {
  const currentShownRows = useRef<Array<any>>([]);
  const [timeelapsed, settimeelapsed] = useState<number>();

  //on a new scroll or filter command, the software should determine if it should
  //1. fetch the whole thing or enter infinite scrolling mode via "scrollmode": "infinite" | "all" as a response from the backend
  // a) the front end in infinite mode would store a rows amount and fetch based on the offset number

  socket.on('gettrans', (data: any) => {
    //process and then update the state
    settimeelapsed(data.timeelapsed);
  });

  function refetch() {
    socket.emit('reqtrans', {
      filter: {
        vendor: {
          //vendoron: true,
          //query: true,
          //exact: true
        },
      },
      //sortby: transaction_date OR item_description OR detailed_item_description OR vendor OR department
    });
  }

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
