const Constants = {
  // regex used to validate date with format yyyy-mm-dd
  DATE_REGEX: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/,
  // regex used to validate email according to WHATWG standard:
  // https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
};

export default Object.freeze(Constants);
