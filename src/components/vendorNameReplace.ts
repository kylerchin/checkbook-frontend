import { titleCase } from 'true-case';

export function vendorNameReplace(inputstring: string) {
  return titleCase(inputstring).replace(/ llc/gi, 'LLC');
}
