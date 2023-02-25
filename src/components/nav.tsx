import { ChangeColour } from './changeColour';
interface nav {
  themeChanger: any;
}
export function Navbar(props: nav) {
  return (
    <>
      <div className='flex flex-row bg-gray-200 px-4 py-2 drop-shadow-lg dark:bg-bruhlessdark dark:bg-bruhdark dark:text-gray-200'>
        <div className='my-auto flex flex-row gap-x-5 font-semibold'>
          <a href='/search'>
            <p className='underline hover:text-gray-800 dark:hover:text-gray-300'>
              Search
            </p>
          </a>
          <a href='/table'>
            <p className='underline hover:text-gray-800 dark:hover:text-gray-300'>
              Full Table
            </p>
          </a>
        </div>
        <div className='align-right ml-auto'>
          <ChangeColour themeChanger={props.themeChanger} />
        </div>
      </div>
    </>
  );
}
