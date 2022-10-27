import * as React from 'react';

import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  return (
    <Layout>
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
                  className=' w-full rounded-full bg-gray-100 px-2 py-2
                
                '
                  placeholder='Search for a vendor, department, or keyword'
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
