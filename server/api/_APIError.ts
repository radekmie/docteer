import clone from 'lodash/clone';

// We store them here for 3 reasons:
//     - language-independence
//     - sureness of presence
//     - same HTTP codes
export const APIErrors = {
  // API logic.
  'api-already-exists': 'Already Exists',
  'api-failed-token': 'Failed JWT Verification',
  'api-forbidden': 'Resource Forbidden',
  'api-internal': 'Internal Server Error',
  'api-invalid-token': 'Invalid JWT',
  'api-json': 'Invalid JSON',
  'api-json-body': 'Invalid JSON - Body Should Be A JSON Object',
  'api-log-in': 'Logged In Access Only',
  'api-log-out': 'Logged Out Access Only',
  'api-not-found': 'Resource Not Found',
  'api-unavailable': 'External Service Unavailable',
  'api-unknown-token': 'Unknown JWT',
  'api-url': 'Failed URL Parsing',
  'api-validation': 'Validation Failed',

  // Business logic.
  'schema-field-duplicated': 'Schema fields must be unique.',
  'user-already-exists': 'User already exists.',
  'user-invalid-credentials': "Sounds good, doesn't work.",
  'user-password-incorrect': 'Incorrect old password.',
  'user-password-mismatch': 'Passwords mismatch.',
};

export type APIErrorOptions = {
  code: keyof typeof APIErrors;
  info?: Record<string, unknown> | undefined;
  text?: string;
};

export class APIError extends Error {
  code: keyof typeof APIErrors;
  http: number;
  info: Record<string, unknown> | undefined;
  text: string;

  constructor({ code, info, text }: APIErrorOptions) {
    super();

    APICheck({ code, info, text });

    this.code = code;
    this.http = APIHTTP(code);
    this.info = clone(info);
    this.text = APIText({ code, info, text });
  }

  toJSON() {
    return this.code === 'api-internal'
      ? { code: this.code, text: this.text }
      : { code: this.code, text: this.text, info: this.info };
  }

  static fromError(error: unknown) {
    if (error instanceof APIError) {
      return error;
    }

    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
      console.info('[API] An invalid error was thrown:', error, error.stack);
    } else {
      console.info('[API] An invalid error was thrown:', error);
    }

    const note = JSON.stringify(error);
    const info = error
      ? note === '{}'
        ? error instanceof Error
          ? { error: { message: error.message, name: error.name } }
          : { error }
        : { error }
      : undefined;

    return new APIError({ code: 'api-internal', info });
  }
}

function APICheck({ code, info, text }: APIErrorOptions) {
  if (typeof code !== 'string') {
    throw APICheckError('APIError.code have to be a string.');
  }

  if (!APIErrors[code]) {
    throw APICheckError('APIError.code have to be defined.');
  }

  // Optional.
  if (info !== undefined && typeof info !== 'object') {
    throw APICheckError('APIError.info have to be an object.');
  }

  // Optional.
  if (text !== undefined && typeof text !== 'string') {
    throw APICheckError('APIError.text have to be a string.');
  }
}

function APICheckError(text: string) {
  return new APIError({ code: 'api-internal', text });
}

function APIHTTP(code: keyof typeof APIErrors) {
  return code === 'api-internal' ? 500 : 200;
}

function APIText({ code, info, text }: APIErrorOptions) {
  let fallback = APIErrors[code];

  if (info) {
    for (const key of Object.keys(info)) {
      fallback = fallback.split(`{{${key}}}`).join(String(info[key]));
    }
  }

  // Some fields left
  if (fallback.indexOf('{{') < fallback.indexOf('}}')) {
    console.info('[API] Insufficient info for code:', code);
  }

  // We are doing it here, because we need to be sure, that "Insufficient ..."
  // warning will be displayed anyway.
  if (text) {
    return text;
  }

  return fallback;
}

export default APIError;
