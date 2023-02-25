
import { titleCase } from 'true-case';


export function departmentNameReplace(inputstring: string) {
 
  let removetheworddepartment = inputstring;

  if (inputstring.match(/non/gi)) {
    console.log('non found')
  } else {
    removetheworddepartment = inputstring.replace(/( )?department( )?(of)?( )?/gi, '');
  }

  return titleCase(removetheworddepartment);
}