import * as React from 'react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import backends from '@/backends.json';

import { Navbar } from '../components/nav';
import Seo from '../components/Seo';
/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

const socket = io(backends.socket);

interface ButtonToExpandInterface {
  showautocomplete: any;
  setshowautocomplete: any;
  value: string;
}

function ButtonToExpand(props: ButtonToExpandInterface) {
  function changeParent() {
    const updatedstate: any = {
      ...props.showautocomplete,
    };

    updatedstate[props.value] = !props.showautocomplete[props.value];
    props.setshowautocomplete(updatedstate);

    return true;
  }

  return (
    <button
      onClick={changeParent}
      className='ml-auto rounded-full bg-black px-3 py-1 text-white dark:border dark:border-gray-500 md:ml-4'
    >
      {props.showautocomplete[props.value] ? 'Collapse' : 'Expand'}
    </button>
  );
}

export default function HomePage(props: any) {
  const [initsearchquery, setinitsearchquery] = useState('');
  const disableneedfirsttype = true;
  const [autocompleteresults, setautocompleteresults] = useState<any>(null);
  const [firstqueryinserted, setfirstqueryinserted] = useState(false);
  const [socketconnected, setsocketconnected] = useState<boolean>(
    socket.connected
  );
  const [depts, setdepts] = useState<Array<any>>([]);
  const [showautocomplete, setshowautocomplete] = useState<any>({
    depts: false,
    desc: false,
    detailed_desc: false,
    account: false,
    vendors: true,
  });

  socket.on('connected', (sendback: any) => {
    setsocketconnected(socket.connected);
    socket.emit('fetchdepts', {
      hi: 'hello',
    });
    socket.emit('allaliases', {});
    socket.emit('mainautocomplete', {
      querystring: initsearchquery.toUpperCase(),
    });

    setTimeout(() => {
      socket.emit('fetchdepts', {
        hi: 'hello',
      });
      socket.emit('mainautocomplete', {
        querystring: initsearchquery.toUpperCase(),
      });
    }, 100);
  });

  socket.on('disconnected', (sendback: any) => {
    setsocketconnected(socket.connected);
  });

  socket.on('allaliasesres', (sendback: any) => {
    console.log(sendback);
  });

  socket.on('autocompleteresponse', (sendback: any) => {
    console.log('response recieved!');

    setautocompleteresults(sendback);
  });

  const connectToServer = () => {
    if (socket.connected === false) {
      console.log('connecting....');
      socket.connect();
    }
  };

  useEffect(() => {
    socket.emit('mainautocomplete', {
      querystring: initsearchquery,
    });
    socket.emit('fetchdepts', {
      hi: 'hello',
    });
  }, [initsearchquery]);

  useEffect(() => {
    connectToServer();

    setInterval(() => {
      connectToServer();
      if (socket.connected !== socketconnected) {
        setsocketconnected(socket.connected);
      }
    }, 1000);

    const myInterval = setInterval(() => {
      if (socket.connected !== socketconnected) {
        setsocketconnected(socket.connected);
        if (socket.connected === true) {
          clearInterval(myInterval);
        }
      }
    }, 300);
  }, []);

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />

      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main className='dark:bg-bruhdark'></main>
    </>
  );
}
