import { createHash, randomBytes } from 'crypto';

/**
 * Generates a high-entropy random opaque token (32 bytes = 64 hex characters)
 * for secure draft and unauthenticated assessment status lookups.
 */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Computes SHA-256 hash of a token for secure database lookup
 * ensuring the raw token is never stored in the database.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Anonymizes client IP address for DPDP consent audit logging
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip.trim()).digest('hex');
}
