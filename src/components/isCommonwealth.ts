export function isCommonwealth(): boolean {
  if (typeof window !== 'undefined') {
    const browserlanguage = window.navigator.language;

    //add countries that use british english spelling
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
      'en-ZW',
      'en-PH',
      'en-IN',
      'en-MY',
      'en-SG',
      'en-HK',
      'en-BW',
      'en-LS',
      'en-MW',
      'en-MZ',
      'en-NA',
      'en-SZ',
      'en-UG',
      'en-ZM',
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