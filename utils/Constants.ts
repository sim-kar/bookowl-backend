const Constants = {
  // regex used to validate date with format yyyy-mm-dd
  DATE_REGEX: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/,
  // regex used to validate email according to WHATWG standard:
  // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  // TODO: filepath to placeholder image for books without a thumbnail from public API
  PLACEHOLDER_IMAGE: '../../assets/images/placeholder_cover.jpg',
  // field used to search by title in public api
  TITLE_FIELD: 'intitle',
  // field used to search by author in public api
  AUTHOR_FIELD: 'inauthor',
  // maximum number of results to get when searching public api
  LIMIT: 15,
  // maximum number of allowed results when using public api
  MAX_ALLOWED_RESULTS: 40,
  // number of days before a book update doesn't affect popular ranking (should be negative)
  POPULAR_DATE_CUTOFF: -30,
};

export default Object.freeze(Constants);
