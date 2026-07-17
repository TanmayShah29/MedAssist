import crypto from 'crypto';
import { logger } from '@/lib/logger';

const ALGORITHM = 'aes-256-gcm';

// We require a 32-byte (256-bit) key encoded as hex in environment variables
function getEncryptionKey(): Buffer {
  const keyHex = process.env.MEDASSIST_ENCRYPTION_KEY;
  if (!keyHex) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MEDASSIST_ENCRYPTION_KEY environment variable is required in production.');
    }
    // Fallback for local development if not provided
    return crypto.scryptSync('local-dev-secret', 'salt', 32);
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypts a string (or serialized JSON) into a base64 string.
 * Output format: iv_length:iv_base64:auth_tag_base64:encrypted_data_base64
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, iv, key);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return `${iv.length}:${iv.toString('base64')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a base64 string back into plaintext.
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(':')) {
    // Return original data if it's not in the encrypted format
    logger.warn('decrypt: data not in encrypted format, returning as-is');
    return encryptedData;
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    logger.warn('decrypt: data not in encrypted format, returning as-is');
    return encryptedData;
  }

  const [, ivBase64, authTagBase64, encryptedTextBase64] = parts;

  try {
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, iv, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedTextBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    logger.error('Decryption failed:', err);
    throw new Error('Failed to decrypt medical data. Encryption key may be invalid.');
  }
}
