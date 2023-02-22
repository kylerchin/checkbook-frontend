import * as React from 'react';

import { TransactionTable } from '../components/TransactionTable';

export default function transactions() {
  //const currentBruh = useRef()

  return (
    <TransactionTable
      optionalcolumns={[
        'transaction_date',
        'description',
        'detailed_item_description',
        'vendor_name',
        'department_name',
        'fund_name',
        'program_name',
        'expenditure_type',
      ]}
    />
  );
}
