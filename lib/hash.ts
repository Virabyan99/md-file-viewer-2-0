// src/lib/hash.ts
import { sha256 } from '@noble/hashes/sha256';

export function hashCodeBlock(code: string): string {
  return Buffer.from(sha256(code)).toString('hex');
}