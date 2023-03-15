import { titleCase } from 'true-case';

export function vendorNameReplace(inputstring: string) {
  let returnstring = titleCase(inputstring).replace(/ llc/gi, ' LLC');

  if (returnstring.match(/privacy-/gi)) {
    returnstring = returnstring.replace(/privacy-/gi, '');

    returnstring = titleCase(returnstring);
  }

  return returnstring;
}