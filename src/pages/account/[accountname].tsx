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
      <div className='mx-auto mx-2  dark:text-gray-100 '>
        <Seo title={`${titleCase(props.accountname)} | LA Checkbook Account`} />
        <BackToSearch />

        <h1>{titleCase(props.accountname)}</h1>
        <h4>Account</h4>
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
                  query: props.accountname,
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
  console.log(context.params.accountname);
  // Pass data to the page via props
  return { props: { accountname: context.params.accountname } };
}
