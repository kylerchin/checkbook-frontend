import * as React from 'react';
import { titleCase } from 'title-case';

import { BackToSearch } from '@/components/backtosearch';
import { isCommonwealth } from '@/components/isCommonwealth';
import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';
import { TransactionTable } from '@/components/TransactionTable';
export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='mx-auto mx-2 mt-2 dark:text-gray-100 md:mt-4'>
        <Seo title={`${titleCase(props.programname)} | LA Checkbook`} />
        <BackToSearch />

        <h1>{titleCase(props.programname)}</h1>
        <h4>{isCommonwealth() ? 'Programme' : 'Program'}</h4>
        <div>
          <div className=''>
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
              filters={{
                account: {
                  query: props.programname,
                  matchtype: 'equals',
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  // Fetch data from external API

  // Pass data to the page via props
  return { props: { programname: context.params.programname } };
}
