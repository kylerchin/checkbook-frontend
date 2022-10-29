import * as React from 'react';
import {useEffect, useState} from 'react';
import { io } from "socket.io-client";

import Seo from '@/components/Seo';
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

const socket = io("http://localhost:3000");

export default function HomePage() {
  const [initsearchquery,setinitsearchquery] = useState("");

  const connectToServer = () => {
    if (socket.connected === false) {
    console.log("connecting....");
    socket.connect();
    }
  }

  useEffect(() => {
    socket.emit("mainautocomplete", {
      querystring: initsearchquery
    })
  }, [initsearchquery]);

  useEffect(() => {
    connectToServer();

    setInterval(() => {
      connectToServer();
    }, 1000)
  }, [])

  function handleChange(event:any) {
    console.log(event.target.value);

    setinitsearchquery(event.target.value);
  }

  return (
    <>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center  justify-center '>
            <div>
              <h1 className='font-base'>Search Los Angeles Spending</h1>
              <div className='mt-2'>
                <input
                  id='checkbooksearch1'
                  className=' w-full rounded-full bg-gray-100 px-2 py-2'
                  value={initsearchquery}
                  onChange={handleChange}
                  placeholder='Search for a vendor, department, or keyword'
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
