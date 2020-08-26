import clone from 'lodash/clone';

export enum APIErrors {
  // API logic.
  'api-failed-token' = 'Failed JWT Verification',
  'api-internal' = 'Internal Server Error',
  'api-invalid-token' = 'Invalid JWT',
  'api-log-in' = 'Logged In Access Only',
  'api-log-out' = 'Logged Out Access Only',
  'api-not-found' = 'Resource Not Found',
  'api-unknown-token' = 'Unknown JWT',
  'api-validation' = 'Validation Failed',

  // Business logic.
  'schema-field-duplicated' = 'Schema fields must be unique.',
  'user-already-exists' = 'User already exists.',
  'user-invalid-credentials' = "Sounds good, doesn't work.",
  'user-password-incorrect' = 'Incorrect old password.',
  'user-password-mismatch' = 'Passwords mismatch.',
}

export type APIErrorOptions = {
  code: keyof typeof APIErrors;
  info?: Record<string, unknown> | undefined;
  text?: string;
};

export class APIError extends Error {
  code: keyof typeof APIErrors;
  info: Record<string, unknown>;
  text: string;

  constructor(options: APIErrorOptions) {
    super();

    APIError.validateOptions(options);

    this.code = APIError.getCode(options);
    this.info = APIError.getInfo(options);
    this.text = APIError.getText(options);
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

    // @ts-expect-error Ajv error.
    const errors = error?.validation;
    if (Array.isArray(errors)) {
      return new APIError({ code: 'api-validation', info: { errors } });
    }

    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
      console.info('[API] An invalid error was thrown:', error, error.stack);
    } else {
      console.info('[API] An invalid error was thrown:', error);
    }

    const text = JSON.stringify(error);
    const info = error
      ? text === '{}'
        ? error instanceof Error
          ? { error: { message: error.message, name: error.name } }
          : { error }
        : { error }
      : undefined;

    return new APIError({ code: 'api-internal', info });
  }

  static getCode({ code }: APIErrorOptions) {
    return code;
  }

  static getInfo({ info }: APIErrorOptions) {
    return info ? clone(info) : {};
  }

  static getText({ code, info, text }: APIErrorOptions) {
    let fallback: string = APIErrors[code];

    if (info) {
      for (const key of Object.keys(info)) {
        fallback = fallback.split(`{{${key}}}`).join(String(info[key]));
      }
    }

    // Some fields left.
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

  static validateOptions({ code, info, text }: APIErrorOptions) {
    if (typeof code !== 'string') {
      throw new APIError({
        code: 'api-internal',
        text: 'APIError.code have to be a string.',
      });
    }

    if (!APIErrors[code]) {
      throw new APIError({
        code: 'api-internal',
        text: 'APIError.code have to be defined.',
      });
    }

    // Optional.
    if (info !== undefined && typeof info !== 'object') {
      throw new APIError({
        code: 'api-internal',
        text: 'APIError.info have to be an object.',
      });
    }

    // Optional.
    if (text !== undefined && typeof text !== 'string') {
      throw new APIError({
        code: 'api-internal',
        text: 'APIError.text have to be a string.',
      });
    }
  }
}
