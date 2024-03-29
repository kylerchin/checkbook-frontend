import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { departmentNameReplace } from '@/components/departmentNameReplace';
import { isCommonwealth } from '@/components/isCommonwealth';
import { VendorElement } from '@/components/TransactionTable';

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
      className='ml-auto rounded-full border border-gray-500 bg-black px-3 py-1 text-white dark:bg-zinc-200 dark:text-gray-900 md:ml-4'
    >
      {props.showautocomplete[props.value] ? 'Collapse' : 'Expand'}
    </button>
  );
}

function stringFromArrayUrl(array: Array<any>) {
  let outstring = '';

  const cleanedinputarray = array.filter(
    (item) => item !== '' && item !== ' ' && item !== undefined && item !== null
  );

  if (cleanedinputarray.length > 0) {
    outstring = '?';
    outstring = outstring + array.join('&');
  }

  return outstring;
}

export default function HomePage(props: any) {
  //if it has the url parameter search, then it will search for that, if not, put blank

  const router = useRouter();
  const { debugmode, search } = router.query;

  const [initsearchquery, setinitsearchquery] = useState<string>(
    search ? String(search) : ''
  );

  const disableneedfirsttype = true;
  const [firstloaded, setfirstloaded] = useState<boolean>(false);
  const [autocompleteresultsfund, setautocompleteresultsfund] =
    useState<any>(null);
  const [autocompleteresultsaccount, setautocompleteresultsaccount] =
    useState<any>(null);

  const [autocompleteresultsprogram, setautocompleteresultsprogram] =
    useState<any>(null);

  const firstloadedref = useRef(false);
  const [autocompleteresults, setautocompleteresults] = useState<any>(null);
  const [firstqueryinserted, setfirstqueryinserted] = useState(false);
  const [socketconnected, setsocketconnected] = useState<boolean>(
    socket.connected
  );
  const [depts, setdepts] = useState<Array<any>>([]);

  const [showautocomplete, setshowautocomplete] = useState<any>({
    depts: true,
    desc: false,
    detailed_desc: false,
    accounts: true,
    funds: true,
    vendors: true,
    programs: true,
  });
  const deptsref = useRef([]);
  const [deptsloaded, setdeptsloaded] = useState<boolean>(false);
  const [filtereddepts, setfiltereddepts] = useState<Array<any>>([]);
  const currentlyshowingvendorquery = useRef(null);
  const currentlyshowingaccountquery = useRef(null);
  const currentlyshowingprogramquery = useRef(null);

  const currentlyshowingfundquery = useRef(null);

  socket.on('connected', (sendback: any) => {
    setsocketconnected(true);
    socket.emit('fetchdepts', {
      hi: 'hello',
    });
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
    setsocketconnected(false);
  });

  socket.on('autocompleteresponse', (sendback: any) => {
    if (currentlyshowingvendorquery.current != initsearchquery.toUpperCase()) {
      setfirstloaded(true);
      firstloadedref.current = true;
      setautocompleteresults(sendback);
      currentlyshowingvendorquery.current = sendback.querystring;
    }
  });

  socket.on('autocompleteresponsefund', (sendback: any) => {
    if (currentlyshowingfundquery.current != initsearchquery.toUpperCase()) {
      setfirstloaded(true);
      firstloadedref.current = true;
      setautocompleteresultsfund(sendback);
      currentlyshowingfundquery.current = sendback.querystring;
    }
  });

  socket.on('autocompleteresponseaccount', (sendback: any) => {
    if (currentlyshowingaccountquery.current != initsearchquery.toUpperCase()) {
      setfirstloaded(true);
      firstloadedref.current = true;
      setautocompleteresultsaccount(sendback);
      currentlyshowingaccountquery.current = sendback.querystring;
    }
  });

  socket.on('autocompleteresponseprogram', (sendback: any) => {
    if (currentlyshowingprogramquery.current != initsearchquery.toUpperCase()) {
      setfirstloaded(true);
      firstloadedref.current = true;
      setautocompleteresultsprogram(sendback);
      currentlyshowingprogramquery.current = sendback.querystring;
    }
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
    router.push(
      `/${stringFromArrayUrl([
        'search=' + encodeURIComponent(initsearchquery),
        debugmode ? 'debugmode=true' : '',
      ])}`,
      undefined,
      { shallow: true }
    );

    socket.emit('mainautocomplete', {
      querystring: initsearchquery,
    });
    socket.emit('fetchdepts', {
      hi: 'hello',
    });
  }, [initsearchquery]);

  useEffect(() => {
    const tortureuntilitloads = () => {
      if (firstloaded === false && firstloadedref.current === false) {
        socket.emit('mainautocomplete', {
          querystring: initsearchquery,
        });

        socket.emit('fetchdepts', {
          hi: 'hello',
        });
      }
    };

    tortureuntilitloads();

    setInterval(() => {
      tortureuntilitloads();
    }, 200);
  });

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
                ? 'mt-2 lg:mt-4'
                : 'items-center  justify-center'
            }`}
          >
            <div className=''>
              <div className='flex flex-row'>
                <h1 className=' dark:text-gray-100 '>
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
                    <p className='mt-auto mb-auto ml-1 hidden md:block'>
                      {socketconnected ? 'Connected' : 'Connecting...'}
                    </p>
                  </div>
                )}
              </div>
              <div className='mt-2'>
                <input
                  id='checkbooksearch1'
                  className=' focus:border-dark-gray-900 w-full rounded-full border border-gray-500 bg-gray-100 px-2 py-2 focus:border-2 dark:border-gray-500 dark:bg-bruhlessdark dark:text-gray-50 focus:dark:border-gray-100 focus:dark:outline-2'
                  value={initsearchquery}
                  onChange={handleChange}
                  autoFocus={true}
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

              {showautocomplete.depts === true && deptsloaded === true && (
                <>
                  {filtereddepts.map((eachDept: any, deptindex: number) => (
                    <Link
                      key={deptindex}
                      className='flex w-full flex-row border-b  border-gray-500 hover:bg-gray-200 hover:bg-gray-200 hover:dark:bg-bruhlessdark lg:w-4/6 '
                      href={`/dept/${encodeURIComponent(
                        eachDept.department_name.toLowerCase().trim()
                      )}${stringFromArrayUrl([
                        debugmode ? `debug=true` : ``,
                        `initsearch=${initsearchquery}`,
                      ])}
                      `}
                    >
                      <div className='flex-grow'>
                        {departmentNameReplace(eachDept.department_name)}
                      </div>
                      <div className='justify-right align-right bold right-align text-right font-bold tabular-nums'>
                        ${parseInt(eachDept.sum).toLocaleString('en-US')}
                      </div>
                    </Link>
                  ))}
                  {filtereddepts.length > 0 && <br />}
                  {deptsloaded &&
                    filtereddepts.length === 0 &&
                    showautocomplete.depts && (
                      <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                        0 matching depts found. Try a different search?
                      </p>
                    )}
                </>
              )}

              {(disableneedfirsttype || firstqueryinserted) && (
                <>
                  {autocompleteresultsfund && (
                    <>
                      <div className='flex flex-row align-bottom'>
                        <h3>Funds</h3>
                        <p className='ml-2 mt-auto mb-[1px] align-bottom text-gray-700 dark:text-gray-300'>
                          {autocompleteresultsfund.rows.length.toLocaleString(
                            'default'
                          )}
                          {autocompleteresultsfund.rows.length > 99 ? '+' : ''}{' '}
                          in {autocompleteresultsfund.timeelapsed.toFixed(1)}
                          ms
                        </p>
                        <ButtonToExpand
                          showautocomplete={showautocomplete}
                          setshowautocomplete={setshowautocomplete}
                          value='funds'
                        />
                      </div>

                      <div
                        className={`${showautocomplete.funds ? '' : 'hidden'}`}
                      >
                        {autocompleteresultsfund.rows &&
                          autocompleteresultsfund.rows.map(
                            (eachItem: any, vendorindex: number) => (
                              <>
                                <Link
                                  key={vendorindex}
                                  className='flex w-full flex-row border-b border-gray-500 hover:bg-gray-200 hover:dark:bg-gray-700 lg:w-4/6'
                                  href={`/fund/${encodeURIComponent(
                                    eachItem.fund_name.toLowerCase().trim()
                                  )}${stringFromArrayUrl([
                                    debugmode ? `debug=true` : ``,
                                    `initsearch=${initsearchquery}`,
                                  ])}`}
                                >
                                  <div className='mr-2'>
                                    <span>
                                      <span>
                                        <VendorElement
                                          vendor_name={eachItem.fund_name}
                                        />
                                      </span>
                                      <span> </span>
                                      <span>{eachItem.fund_id}</span>
                                    </span>
                                  </div>

                                  <div className='justify-right align-right bold right-align ml-auto  text-right font-bold tabular-nums'>
                                    <p className='tabular-nums'>
                                      $
                                      {parseInt(eachItem.sum).toLocaleString(
                                        'en-US'
                                      )}
                                    </p>
                                  </div>
                                  {false && (
                                    <div className='justify-right align-right ml-2 mr-2 w-32 '>
                                      <p className='justify-right right-align align-right text-right tabular-nums text-gray-600 dark:text-zinc-300'>
                                        {parseInt(
                                          eachItem.count
                                        ).toLocaleString('en-US')}
                                        {' rows)'}
                                      </p>
                                    </div>
                                  )}
                                </Link>
                              </>
                            )
                          )}
                        {autocompleteresultsfund.rows.length > 0 && <br />}
                        {autocompleteresultsfund.rows.length === 0 && (
                          <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                            0 matching accounts found. Try a different search?
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {autocompleteresultsaccount && (
                    <>
                      <div className='flex flex-row align-bottom'>
                        <h3>Accounts</h3>
                        <p className='ml-2 mt-auto mb-[1px] align-bottom text-gray-700 dark:text-gray-300'>
                          {autocompleteresultsaccount.rows.length.toLocaleString(
                            'default'
                          )}
                          {autocompleteresultsaccount.rows.length > 99
                            ? '+'
                            : ''}{' '}
                          in {autocompleteresultsaccount.timeelapsed.toFixed(1)}
                          ms
                        </p>
                        <ButtonToExpand
                          showautocomplete={showautocomplete}
                          setshowautocomplete={setshowautocomplete}
                          value='accounts'
                        />
                      </div>

                      <div
                        className={`${
                          showautocomplete.accounts ? '' : 'hidden'
                        }`}
                      >
                        {autocompleteresultsaccount.rows &&
                          autocompleteresultsaccount.rows.map(
                            (eachVendor: any, vendorindex: number) => (
                              <>
                                <Link
                                  key={vendorindex}
                                  className='flex w-full flex-row border-b border-gray-500 hover:bg-gray-200 hover:dark:bg-gray-700 lg:w-4/6'
                                  href={`/account/${encodeURIComponent(
                                    eachVendor.account_name.toLowerCase().trim()
                                  )}${stringFromArrayUrl([
                                    debugmode ? `debug=true` : ``,
                                    `initsearch=${initsearchquery}`,
                                  ])}`}
                                >
                                  <div className='mr-2'>
                                    <span>
                                      <VendorElement
                                        vendor_name={eachVendor.account_name}
                                      />
                                    </span>
                                  </div>

                                  <div className='justify-right align-right bold right-align ml-auto  text-right font-bold tabular-nums'>
                                    <p className='tabular-nums'>
                                      $
                                      {parseInt(eachVendor.sum).toLocaleString(
                                        'en-US'
                                      )}
                                    </p>
                                  </div>
                                  {false && (
                                    <div className='justify-right align-right ml-2 mr-2 w-32 '>
                                      <p className='justify-right right-align align-right text-right tabular-nums text-gray-600 dark:text-zinc-300'>
                                        {parseInt(
                                          eachVendor.count
                                        ).toLocaleString('en-US')}
                                        {' rows)'}
                                      </p>
                                    </div>
                                  )}
                                </Link>
                              </>
                            )
                          )}

                        {autocompleteresultsaccount.rows.length > 0 && <br />}
                        {autocompleteresultsaccount.rows.length === 0 && (
                          <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                            0 matching accounts found. Try a different search?
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {autocompleteresultsprogram && (
                    <>
                      <div className='flex flex-row align-bottom'>
                        <h3>{isCommonwealth() ? 'Programmes' : 'Programs'}</h3>
                        <p className='ml-2 mt-auto mb-[1px] align-bottom text-gray-700 dark:text-gray-300'>
                          {autocompleteresultsprogram.rows.length.toLocaleString(
                            'default'
                          )}
                          {autocompleteresultsprogram.rows.length > 99
                            ? '+'
                            : ''}{' '}
                          in {autocompleteresultsprogram.timeelapsed.toFixed(1)}
                          ms
                        </p>
                        <ButtonToExpand
                          showautocomplete={showautocomplete}
                          setshowautocomplete={setshowautocomplete}
                          value='programs'
                        />
                      </div>

                      <div
                        className={`${
                          showautocomplete.programs ? '' : 'hidden'
                        }`}
                      >
                        {autocompleteresultsprogram.rows &&
                          autocompleteresultsprogram.rows.map(
                            (eachItem: any, vendorindex: number) => (
                              <>
                                <Link
                                  key={vendorindex}
                                  className='flex w-full flex-row border-b border-gray-500 hover:bg-gray-200 hover:dark:bg-gray-700 lg:w-4/6'
                                  href={`/program/${encodeURIComponent(
                                    eachItem.program.toLowerCase().trim()
                                  )}${stringFromArrayUrl([
                                    debugmode ? `debug=true` : ``,
                                    `initsearch=${initsearchquery}`,
                                  ])}`}
                                >
                                  <div className='mr-2'>
                                    <span>
                                      <VendorElement
                                        vendor_name={eachItem.program}
                                      />
                                    </span>
                                  </div>

                                  <div className='justify-right align-right bold right-align ml-auto  text-right font-bold tabular-nums'>
                                    <p className='tabular-nums'>
                                      $
                                      {parseInt(eachItem.sum).toLocaleString(
                                        'en-US'
                                      )}
                                    </p>
                                  </div>
                                  {false && (
                                    <div className='justify-right align-right ml-2 mr-2 w-32 '>
                                      <p className='justify-right right-align align-right text-right tabular-nums text-gray-600 dark:text-zinc-300'>
                                        {parseInt(
                                          eachItem.count
                                        ).toLocaleString('en-US')}
                                        {' rows)'}
                                      </p>
                                    </div>
                                  )}
                                </Link>
                              </>
                            )
                          )}

                        {autocompleteresultsprogram.rows.length > 0 && <br />}
                        {autocompleteresultsprogram.rows.length === 0 && (
                          <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                            0 matching{' '}
                            {isCommonwealth() ? 'programmes' : 'programs'}{' '}
                            found. Try a different search?
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {autocompleteresults && (
                    <>
                      <div className='flex flex-row align-bottom'>
                        <h3>Vendors</h3>
                        <p className='ml-2 mt-auto mb-[1px] align-bottom text-gray-700 dark:text-gray-300'>
                          {autocompleteresults.rows.length.toLocaleString(
                            'default'
                          )}
                          {autocompleteresults.rows.length > 99 ? '+' : ''} in{' '}
                          {autocompleteresults.timeelapsed.toFixed(1)}ms
                        </p>
                        <ButtonToExpand
                          showautocomplete={showautocomplete}
                          setshowautocomplete={setshowautocomplete}
                          value='vendors'
                        />
                      </div>

                      <div
                        className={`${
                          showautocomplete.vendors ? '' : 'hidden'
                        }`}
                      >
                        {autocompleteresults.aliasforwardingstatus === true && (
                          <p className='italics text-gray-700 dark:text-gray-300'>
                            Also showing results for{' '}
                            <span className='font-semibold text-gray-700 dark:text-gray-200'>
                              <VendorElement
                                vendor_name={
                                  autocompleteresults.aliasforwardingto
                                }
                              />
                            </span>
                          </p>
                        )}
                        {autocompleteresults.rows &&
                          autocompleteresults.rows.map(
                            (eachVendor: any, vendorindex: number) => (
                              <>
                                {debugmode && (
                                  <p className='italic text-gray-700 dark:text-gray-300'>
                                    {eachVendor.vendor_name}
                                  </p>
                                )}
                                <Link
                                  key={vendorindex}
                                  className='flex w-full flex-row border-b border-gray-500 hover:bg-gray-200 hover:dark:bg-gray-700 lg:w-4/6'
                                  href={`/vendor/${encodeURIComponent(
                                    eachVendor.vendor_name.toLowerCase().trim()
                                  )}${stringFromArrayUrl([
                                    debugmode ? `debug=true` : ``,
                                    `initsearch=${initsearchquery}`,
                                  ])}`}
                                >
                                  <div className='mr-2'>
                                    <span>
                                      <VendorElement
                                        vendor_name={eachVendor.vendor_name}
                                      />
                                    </span>
                                  </div>

                                  <div className='justify-right align-right bold right-align ml-auto  text-right font-bold tabular-nums'>
                                    <p className='tabular-nums'>
                                      $
                                      {parseInt(eachVendor.sum).toLocaleString(
                                        'en-US'
                                      )}
                                    </p>
                                  </div>
                                  {false && (
                                    <div className='justify-right align-right ml-2 mr-2 w-32 '>
                                      <p className='justify-right right-align align-right text-right tabular-nums text-gray-600 dark:text-zinc-300'>
                                        {parseInt(
                                          eachVendor.count
                                        ).toLocaleString('en-US')}
                                        {' rows)'}
                                      </p>
                                    </div>
                                  )}
                                </Link>
                              </>
                            )
                          )}
                        {autocompleteresults.rows.length === 0 && (
                          <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
                            0 matching vendors found. Try a different search?
                          </p>
                        )}
                        {autocompleteresults.rows.length > 0 && <br />}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <br />
          <br />
        </section>
      </main>
    </>
  );
}
