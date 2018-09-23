// @flow

import clone from 'lodash/clone';

// We store them here for 3 reasons:
//     - language-independence
//     - sureness of presence
//     - same HTTP codes
// prettier-ignore
export const APIErrors = {
  // API logic.
  'api-already-exists':       'Already Exists',
  'api-failed-token':         'Failed JWT Verification',
  'api-forbidden':            'Resource Forbidden',
  'api-internal':             'Internal Server Error',
  'api-invalid-token':        'Invalid JWT',
  'api-json':                 'Invalid JSON',
  'api-json-body':            'Invalid JSON - Body Should Be A JSON Object',
  'api-log-in':               'Logged In Access Only',
  'api-log-out':              'Logged Out Access Only',
  'api-not-found':            'Resource Not Found',
  'api-unavailable':          'External Service Unavailable',
  'api-unknown-token':        'Unknown JWT',
  'api-url':                  'Failed URL Parsing',
  'api-validation':           'Validation Failed',

  // Business logic.
  'user-already-exists':      'User already exists.',
  'user-invalid-credentials': "Sounds good, doesn't work.",
  'user-password-incorrect':  'Incorrect old password.',
  'user-password-mismatch':   'Passwords mismatch.',
};

export class APIError extends Error {
  // eslint-disable-next-line
  code: $Keys<typeof APIErrors>;
  http: number;
  info: ?{[string]: mixed};
  text: string;

  /**
   * APIError
   *     General class for errors. It's the only accepted by the API, so if any
   *     other error will be thrown, then standard HTTP 500 error will be used
   *     instead to make sure, that every error is being thrown on a purpose.
   *     Also, every code have to be translated and present in APIErrors.
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
    this.info = clone(info);
    this.text = APIText(text, code, info);
  }

  toJSON() {
    return this.code === 'api-internal'
      ? {code: this.code, text: this.text}
      : {code: this.code, text: this.text, info: this.info};
  }

  static fromError(error: mixed) {
    if (error instanceof APIError) return error;

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
  return code === 'api-internal' ? 500 : 200;
}

function APIText(text, code, info) {
  let fallback = APIErrors[code];

  if (info)
    for (const key of Object.keys(info))
      fallback = fallback.split(`{{${key}}}`).join(String(info[key]));

  // Some fields left
  if (fallback.indexOf('{{') < fallback.indexOf('}}'))
    console.info('[API] Insufficient info for code:', code);

  // We are doing it here, because we need to be sure, that "Insufficient ..."
  // warning will be displayed anyway.
  if (text) return text;

  return fallback;
}

export default APIError;
