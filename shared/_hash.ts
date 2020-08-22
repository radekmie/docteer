// @ts-expect-error Internal module.
import sha256 from 'hash.js/lib/hash/sha/256';

export function hash(text: string) {
  return {
    algorithm: 'sha-256',
    digest: sha256().update(text).digest('hex'),
  };
}
