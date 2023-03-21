import * as React from 'react';
import { titleCase } from 'title-case';

import { BackToSearch } from '@/components/backtosearch';
import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';
import { TransactionTable } from '@/components/TransactionTable';

export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='mx-auto mx-2 dark:text-gray-100 '>
        <Seo title={`${titleCase(props.fundname)} | LA Checkbook Fund`} />
        <BackToSearch />

        <h1>{titleCase(props.fundname)}</h1>
        <h4>Fund</h4>
        <div>
          <div className=''>
            <TransactionTable
              optionalcolumns={[
                'department_name',
                'vendor_name',
                'account_name',
                'program',
                'expenditure_type',
                'description',
                'detailed_item_description',
                'quantity',
              ]}
              filters={{
                fund: {
                  query: props.fundname,
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
  return { props: { fundname: context.params.fundname } };
}
