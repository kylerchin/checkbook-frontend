import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { titleCase } from 'true-case';

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

const socket = io('https://checkkirby.lacontroller.io/');

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
  const deptsref = useRef([]);
  const [deptsloaded, setdeptsloaded] = useState<boolean>(false);
  const [filtereddepts, setfiltereddepts] = useState<Array<any>>([]);

  socket.on('connected', (sendback: any) => {
    setsocketconnected(socket.connected);
    socket.emit('fetchdepts', {
      hi: 'hello',
    });
    socket.emit('mainautocomplete', {
      querystring: initsearchquery,
    });

    setTimeout(() => {
      socket.emit('fetchdepts', {
        hi: 'hello',
      });
      socket.emit('mainautocomplete', {
        querystring: initsearchquery,
      });
    }, 100);
  });

  socket.on('disconnected', (sendback: any) => {
    setsocketconnected(socket.connected);
  });

  socket.on('autocompleteresponse', (sendback: any) => {
    console.log('response recieved!');

    setautocompleteresults(sendback);
  });

  socket.on('alldepts', (sendback: any) => {
    console.log('got depts back');
    setdepts(sendback.rows);
    deptsref.current = sendback.rows;
    setdeptsloaded(true);
    handleSetFilteredDepts();
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

  function handleChange(event: any) {
    console.log(event.target.value);

    const querystring = event.target.value;

    if (firstqueryinserted === false && querystring.trim().length > 0) {
      setfirstqueryinserted(true);
    }

    setinitsearchquery(event.target.value);
  }

  function handleSetFilteredDepts() {
    const filtereddepts = deptsref.current.filter((eachDept: any) => {
      let include = true;

      if (initsearchquery.length > 0) {
        if (
          eachDept.department_name
            .toLowerCase()
            .includes(initsearchquery.toLowerCase())
        ) {
          include = true;
        } else {
          include = false;
        }
      }

      return include;
    });

    setfiltereddepts(filtereddepts);
  }

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />

      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main className='dark:bg-bruhdark'>
        <section className='bg-white dark:bg-bruhdark dark:text-gray-50'>
          <div
            className={`layout flex min-h-screen flex-col ${
              disableneedfirsttype || firstqueryinserted
                ? 'mt-4'
                : 'items-center  justify-center'
            }`}
          >
            <div className=''>
              <div className='flex flex-row'>
                <h1 className='font-sm md:font-base dark:text-gray-100'>
                  Search LA City Spending
                </h1>

                {(disableneedfirsttype || firstqueryinserted) && (
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
                )}
              </div>
              <div className='mt-2'>
                <input
                  id='checkbooksearch1'
                  className=' w-full rounded-full bg-gray-100 px-2 py-2 dark:bg-bruhlessdark dark:text-gray-50'
                  value={initsearchquery}
                  onChange={handleChange}
                  placeholder='Search for a vendor, department, or keyword'
                />
              </div>
            </div>
            <div
              className={`${
                disableneedfirsttype || firstqueryinserted ? '' : 'hidden'
              }`}
            >
              <div className=' flex flex-row align-bottom'>
                <h3>Departments</h3>
                <p className='ml-2 mt-auto mb-[1px] align-bottom text-gray-700 dark:text-gray-300'>
                  {filtereddepts.length} of {depts.length}
                </p>
                <ButtonToExpand
                  showautocomplete={showautocomplete}
                  setshowautocomplete={setshowautocomplete}
                  value='depts'
                />
              </div>

              {showautocomplete.depts === true &&
                deptsloaded === true &&
                filtereddepts.map((eachDept: any, deptindex: number) => (
                  <a
                    key={deptindex}
                    className='flex w-full flex-row border-b  border-gray-500 hover:bg-gray-200 hover:bg-gray-200 hover:dark:bg-bruhlessdark lg:w-4/6 '
                    href={`/dept/${encodeURIComponent(
                      eachDept.department_name.toLowerCase().trim()
                    )}`}
                  >
                    <div className='flex-grow'>
                      {titleCase(
                        eachDept.department_name.replace(/( )?department/gi, '')
                      )}
                    </div>
                    <div className='justify-right align-right bold right-align text-right font-bold tabular-nums'>
                      ${parseInt(eachDept.sum).toLocaleString('en-US')}
                    </div>
                  </a>
                ))}
              {deptsloaded &&
                filtereddepts.length === 0 &&
                showautocomplete.depts && (
                  <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                    0 matching depts found. Try a different search?
                  </p>
                )}

              {(disableneedfirsttype || firstqueryinserted) &&
                autocompleteresults && (
                  <>
                    <div className='flex flex-row align-bottom'>
                      <h3>Vendors</h3>
                      <p className='ml-2 mt-auto mb-[1px] align-bottom text-gray-700 dark:text-gray-300'>
                        in {autocompleteresults.timeelapsed.toFixed(1)}ms
                      </p>
                      <ButtonToExpand
                        showautocomplete={showautocomplete}
                        setshowautocomplete={setshowautocomplete}
                        value='vendors'
                      />
                    </div>
                    <div
                      className={`${showautocomplete.vendors ? '' : 'hidden'}`}
                    >
                      {autocompleteresults.rows &&
                        autocompleteresults.rows.map(
                          (eachVendor: any, vendorindex: number) => (
                            <a
                              key={vendorindex}
                              className='flex w-full flex-row border-b border-gray-500 hover:bg-gray-200 hover:dark:bg-gray-700 lg:w-4/6'
                              href={`/vendors/${encodeURIComponent(
                                eachVendor.vendor_name.toLowerCase().trim()
                              )}`}
                            >
                              <div className='flex-grow'>
                                {titleCase(eachVendor.vendor_name)}
                              </div>
                              <div className='justify-right align-right bold right-align text-right font-bold tabular-nums'>
                                <p className='tabular-nums'>
                                  $
                                  {parseInt(eachVendor.sum).toLocaleString(
                                    'en-US'
                                  )}
                                </p>
                              </div>
                            </a>
                          )
                        )}
                      {autocompleteresults.rows.length === 0 && (
                        <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                          0 matching vendors found. Try a different search?
                        </p>
                      )}
                    </div>
                  </>
                )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
