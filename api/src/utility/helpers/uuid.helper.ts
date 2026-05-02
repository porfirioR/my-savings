import { createHash } from 'crypto';

// Generates a deterministic UUID v5-like from any string.
// Same input always produces the same UUID, so reference lookups remain idempotent.
export function toReferenceUuid(reference: string): string {
  const hash = createHash('sha1').update(reference).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '5' + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}
