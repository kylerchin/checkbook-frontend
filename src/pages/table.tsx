import * as React from 'react';

import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';
import { TransactionTable } from '@/components/TransactionTable';

export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='mx-auto mx-2 mt-2 dark:text-gray-100 md:mt-4'>
        <Seo title='Table Explorer | LA Checkbook' />

        <div>
          <div className=''>
            <TransactionTable
              optionalcolumns={[
                'vendor_name',
                'fund_name',
                'program',
                'expenditure_type',
                'description',
                'detailed_item_description',
              ]}
              filters={{}}
            />
          </div>
        </div>
      </div>
    </>
  );
}
