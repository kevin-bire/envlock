import { ParsedEnv } from '../parser/envParser';
import { encryptValue, decryptValue, deriveKey } from '../encrypt/envEncrypt';

export interface RotateResult {
  key: string;
  rotated: boolean;
  error?: string;
}

export interface RotateSummary {
  total: number;
  rotated: number;
  failed: number;
  results: RotateResult[];
}

export async function rotateKey(
  env: ParsedEnv,
  key: string,
  oldPassword: string,
  newPassword: string
): Promise<RotateResult> {
  const entry = env[key];
  if (!entry || entry.value === null) {
    return { key, rotated: false, error: 'Key not found or has no value' };
  }

  try {
    const oldKey = await deriveKey(oldPassword);
    const decrypted = await decryptValue(entry.value, oldKey);
    const newKey = await deriveKey(newPassword);
    const reEncrypted = await encryptValue(decrypted, newKey);
    env[key] = { ...entry, value: reEncrypted };
    return { key, rotated: true };
  } catch (err) {
    return { key, rotated: false, error: (err as Error).message };
  }
}

export async function rotateEnv(
  env: ParsedEnv,
  keys: string[],
  oldPassword: string,
  newPassword: string
): Promise<RotateSummary> {
  const results: RotateResult[] = [];

  for (const key of keys) {
    const result = await rotateKey(env, key, oldPassword, newPassword);
    results.push(result);
  }

  const rotated = results.filter((r) => r.rotated).length;
  const failed = results.filter((r) => !r.rotated).length;

  return {
    total: keys.length,
    rotated,
    failed,
    results,
  };
}

export function getEncryptedKeys(env: ParsedEnv): string[] {
  return Object.entries(env)
    .filter(([, entry]) => entry.value !== null && entry.value.startsWith('enc:'))
    .map(([key]) => key);
}
