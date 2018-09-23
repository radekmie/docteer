// @flow

import sha from 'js-sha256';

export function hash(text: string) {
  return {algorithm: 'sha-256', digest: sha.sha256(text)};
}
