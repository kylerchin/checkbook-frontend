import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

export function BackToSearch(props: any) {
  const router = useRouter();

  const { initsearch } = router.query;

  const calculateLink = () => {
    console.log('back to search component: initsearch', initsearch);
    if (initsearch) {
      return `/?search=${initsearch}`;
    } else {
      return '/';
    }
  };

  return (
    <Link href={calculateLink()} className='ml-2 underline'>
      <p className='ml-2 underline hover:text-blue-900 dark:text-blue-200 hover:dark:text-blue-50'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='mr-2 inline h-5 w-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18'
          />
        </svg>
        Back to Search
        {initsearch ? (
          <>
            {' for '}
            <span className='font-semibold'>{initsearch}</span>
          </>
        ) : (
          ''
        )}
      </p>
    </Link>
  );
}
