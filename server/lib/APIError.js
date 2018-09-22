// @flow

// We store them here for 3 reasons:
//     - language-independence
//     - sureness of presence
//     - same HTTP codes
// prettier-ignore
export const APIErrors = {
  // API logic.
  'api-already-exists':       {http: 409, text: 'Already Exists'},
  'api-failed-token':         {http: 400, text: 'Failed JWT Verification'},
  'api-forbidden':            {http: 403, text: 'Resource Forbidden'},
  'api-internal':             {http: 500, text: 'Internal Server Error'},
  'api-invalid-token':        {http: 400, text: 'Invalid JWT'},
  'api-json':                 {http: 400, text: 'Invalid JSON'},
  'api-json-body':            {http: 400, text: 'Invalid JSON - Body Should Be A JSON Object'},
  'api-log-in':               {http: 409, text: 'Logged In Access Only'},
  'api-log-out':              {http: 409, text: 'Logged Out Access Only'},
  'api-not-found':            {http: 404, text: 'Resource Not Found'},
  'api-unavailable':          {http: 503, text: 'External Service Unavailable'},
  'api-unknown-token':        {http: 400, text: 'Unknown JWT'},
  'api-url':                  {http: 422, text: 'Failed URL Parsing'},
  'api-validation':           {http: 422, text: 'Validation Failed'},

  // Business logic.
  'user-already-exists':      {http: 409, text: 'User already exists.'},
  'user-invalid-credentials': {http: 400, text: "Sounds good, doesn't work."},
  'user-password-incorrect':  {http: 422, text: 'Incorrect old password.'},
  'user-password-mismatch':   {http: 422, text: 'Passwords mismatch.'},
};

function APICheck({code, info, text}) {
  if (typeof code !== 'string')
    throw APICheckError('APIError.code have to be a string.');
  if (!APIErrors[code])
    throw APICheckError('APIError.code have to be defined.');

  // Optional.
  if (info !== undefined && typeof info !== 'object')
    throw APICheckError('APIError.info have to be an object.');

  // Optional.
  if (text !== undefined && typeof text !== 'string')
    throw APICheckError('APIError.text have to be a string.');
}

function APICheckError(text) {
  return new APIError({code: 'api-internal', text});
}

function APIHTTP(code) {
  return APIErrors[code].http;
}

function APIText(text, code, info) {
  let fallback = APIErrors[code].text;

  if (info)
    for (const key of Object.keys(info))
      fallback = fallback.split(`{{${key}}}`).join(info[key]);

  // Some fields left
  if (fallback.indexOf('{{') < fallback.indexOf('}}'))
    console.info('[API] Insufficient info for code:', code);

  // We are doing it here, because we need to be sure, that "Insufficient ..."
  // warning will be displayed anyway.
  if (text) return text;

  return fallback;
}

export class APIError extends Error {
  // eslint-disable-next-line
  code: $Keys<typeof APIErrors>;
  http: number;
  info: ?{[string]: mixed};
  text: string;

  /**
   * APIError
   *     General class for errors. It can be used instead of Meteor.Error, and
   *     it will be treated in the same way (i.e. it will be passed to the
   *     client as a normal error, not "500 Internal Server Error"). It's the
   *     only accepted by the API, so if any other error will be thrown, then
   *     standard HTTP 500 error will be used instead to make sure, that every
   *     error is being thrown on a purpose, not by mistake. Also, every code
   *     have to be translated and present in APIErrors.
   *
   * @param  {String}   options.code  Distinctive code.
   * @param  {Object?}  options.info  Additional info.
   * @param  {String?}  options.text  Meaningful description.
   *
   * @example
   *     new APIError({
   *         code: 'api-internal'
   *     })
   *
   * @example
   *     new APIError({
   *         code: 'restaurant-not-found',
   *         info: {id: 'xxx'}
   *     })
   *
   * @example
   *     new APIError({
   *         code: 'booking-no-double',
   *         info: {id: 'xxx'},
   *         text: 'No double bookings.'
   *     })
   */
  // eslint-disable-next-line
  constructor ({code, info, text}: {code: $Keys<typeof APIErrors>, info?: {[string]: mixed}, text?: string}) {
    super();

    APICheck({code, info, text});

    this.code = code;
    this.http = APIHTTP(code);
    this.info = info;
    this.text = APIText(text, code, info);
  }

  toJSON() {
    return this.code === 'api-internal'
      ? {code: this.code, text: this.text}
      : {code: this.code, text: this.text, info: this.info};
  }

  static fromError(error) {
    if (error instanceof APIError) return error;
    if (error.error === 'validation-error')
      return new APIError({
        code: 'api-validation',
        info: {
          errors: error.details
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({name, type}) => ({
              name,
              type: type === 'expectedConstructor' ? 'badDate' : type
            }))
        }
      });

    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
      console.info('[API] An invalid error was thrown:', error, error.stack);
    } else {
      console.info('[API] An invalid error was thrown:', error);
    }

    const note = JSON.stringify(error);
    const info = error
      ? note === '{}'
        ? error instanceof Error
          ? {error: {message: error.message, name: error.name}}
          : {error}
        : {error}
      : undefined;

    return new APIError({code: 'api-internal', info});
  }
}
