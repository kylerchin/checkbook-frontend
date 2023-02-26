import Link from 'next/link';

import { ChangeColour } from './changeColour';
interface nav {
  themeChanger: any;
}
export function Navbar(props: nav) {
  return (
    <>
      <div className='flex flex-row bg-gray-200 py-1 px-2 drop-shadow-lg dark:bg-bruhlessdark dark:text-gray-200 md:px-4'>
        <div className='my-auto flex flex-row gap-x-5 font-semibold'>
          <Link href='/'>
            <p className='underline hover:text-gray-800 dark:hover:text-gray-300'>
              Search
            </p>
          </Link>
          <Link href='/table'>
            <p className='underline hover:text-gray-800 dark:hover:text-gray-300'>
              Full Table
            </p>
          </Link>
        </div>
        <div className='align-right ml-auto'>
          <ChangeColour />
        </div>
      </div>
    </>
  );
}
