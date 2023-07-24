const CONSTANTS = {
  // regex used to validate date with format yyyy-mm-dd
  dateRegex: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/,

  // regex used to validate a book's published date with format yyyy-mm-dd or yyyy-mm or yyyy
  // since the published date is inconsistent in public api
  publishedDateRegex: /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/,

  // regex used to validate email according to WHATWG standard:
  // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  // filepath to placeholder image for books without a thumbnail from public API
  placeholderImage: '../../assets/images/placeholder_cover.jpg',

  // field used to search by title in public api
  titleField: 'intitle',

  // field used to search by author in public api
  authorField: 'inauthor',

  // maximum number of results to get when searching public api
  limit: 15,

  // maximum number of allowed results when using public api
  maxAllowedResults: 40,

  // number of most recent results that are used to generate popular books
  popularResultsLimit: 100,
};

export default Object.freeze(CONSTANTS);
