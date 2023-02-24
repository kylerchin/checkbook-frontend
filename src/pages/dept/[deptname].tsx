import * as React from 'react';

import { TransactionTable } from '@/components/TransactionTable';

import backends from '@/backends.json';

export default function Departments(props: any): JSX.Element {
  // Render data...

  return (
    <>
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
            filters={{
              department: {
                query: props.deptname,
                matchtype: 'equals',
              },
            }}
          />
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
