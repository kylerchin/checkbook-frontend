import * as React from 'react';

import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';
import { TransactionTable } from '@/components/TransactionTable';

export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='relative mt-2 dark:text-gray-100 md:mt-4'>
        <Seo title='Table Explorer | LA Checkbook' />

        <div className='relative'>
          <div className='relative'>
            <TransactionTable
              optionalcolumns={[
                'department_name',
                'vendor_name',
                'fund_name',
                'program',
                'expenditure_type',
                'description',
                'detailed_item_description',
                'quantity',
              ]}
              filters={{}}
            />
          </div>
        </div>
      </div>
    </>
  );
}
