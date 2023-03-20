import * as React from 'react';

import { BackToSearch } from '@/components/backtosearch';
import { departmentNameReplace } from '@/components/departmentNameReplace';
import { Navbar } from '@/components/nav';
import Seo from '@/components/Seo';
import { TransactionTable } from '@/components/TransactionTable';

import backends from '@/backends.json';

export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
      <Navbar themeChanger={props.themeChanger} />
      <div className='mx-auto mx-2 mt-2 dark:text-gray-100 md:mt-4'>
        <Seo
          title={`${departmentNameReplace(
            props.deptname
          )} | LA Checkbook Department`}
        />
        <BackToSearch />

        <h1>{departmentNameReplace(props.deptname)}</h1>
        <h4>Department</h4>
        <div>
          <div className=''>
            <TransactionTable
              optionalcolumns={[
                'vendor_name',
                'fund_name',
                'account_name',
                'program',
                'expenditure_type',
                'description',
                'detailed_item_description',
                'quantity',
              ]}
              filters={{
                department: {
                  query: props.deptname,
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

  const inputobject = {
    params: {
      deptname: context.params.deptname,
    },
  };

  const res = await fetch(`${backends.http}/deptpage/`, {
    method: 'POST',
    body: JSON.stringify(inputobject),
  });
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data, deptname: context.params.deptname } };
}
