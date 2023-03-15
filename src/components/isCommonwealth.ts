export function isCommonwealth(): boolean {
  if (typeof window !== 'undefined') {
    const browserlanguage = window.navigator.language;

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
  } else {
    return false;
  }
}