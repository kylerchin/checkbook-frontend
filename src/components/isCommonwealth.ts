export function isCommonwealth(): boolean {
  const browserlanguage = navigator.language;

  const commonwealth = [
    'en-GB',
    'en-AU',
    'en-CA',
    'en-NZ',
    'en-ZA',
    'en-IE',
    'en-JM',
    'en-BZ',
    'en-TT',
    //add welsh
    'cy-GB'
  ];

  if (commonwealth.includes(browserlanguage)) {
    return true;
  } else {
    return false;
  }
}