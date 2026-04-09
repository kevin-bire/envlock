import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, 'envlock-salt', KEY_LENGTH);
}

export function encryptValue(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptValue(ciphertext: string, secret: string): string {
  const key = deriveKey(secret);
  const data = Buffer.from(ciphertext, 'base64');

  if (data.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid ciphertext: too short');
  }

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

export function encryptEnv(
  env: Record<string, string>,
  secret: string,
  keys?: string[]
): Record<string, string> {
  const result: Record<string, string> = { ...env };
  const targets = keys ?? Object.keys(env);

  for (const key of targets) {
    if (key in result) {
      result[key] = `enc:${encryptValue(result[key], secret)}`;
    }
  }

  return result;
}

export function decryptEnv(
  env: Record<string, string>,
  secret: string
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (value.startsWith('enc:')) {
      result[key] = decryptValue(value.slice(4), secret);
    } else {
      result[key] = value;
    }
  }

  return result;
}
