import { rotateEnv, rotateKey, getEncryptedKeys } from '../envRotate';
import { encryptValue, deriveKey } from '../../encrypt/envEncrypt';
import { ParsedEnv } from '../../parser/envParser';

async function makeEncryptedEnv(password: string): Promise<ParsedEnv> {
  const key = await deriveKey(password);
  const encryptedA = await encryptValue('secret_a', key);
  const encryptedB = await encryptValue('secret_b', key);
  return {
    KEY_A: { value: encryptedA, comment: null, raw: '' },
    KEY_B: { value: encryptedB, comment: null, raw: '' },
    KEY_C: { value: 'plaintext', comment: null, raw: '' },
  };
}

describe('rotateKey', () => {
  it('rotates an encrypted key with new password', async () => {
    const env = await makeEncryptedEnv('old-pass');
    const result = await rotateKey(env, 'KEY_A', 'old-pass', 'new-pass');
    expect(result.rotated).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns error for missing key', async () => {
    const env = await makeEncryptedEnv('old-pass');
    const result = await rotateKey(env, 'MISSING', 'old-pass', 'new-pass');
    expect(result.rotated).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for wrong old password', async () => {
    const env = await makeEncryptedEnv('old-pass');
    const result = await rotateKey(env, 'KEY_A', 'wrong-pass', 'new-pass');
    expect(result.rotated).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('rotateEnv', () => {
  it('rotates all specified keys', async () => {
    const env = await makeEncryptedEnv('old-pass');
    const summary = await rotateEnv(env, ['KEY_A', 'KEY_B'], 'old-pass', 'new-pass');
    expect(summary.total).toBe(2);
    expect(summary.rotated).toBe(2);
    expect(summary.failed).toBe(0);
  });

  it('reports failures in summary', async () => {
    const env = await makeEncryptedEnv('old-pass');
    const summary = await rotateEnv(env, ['KEY_A', 'MISSING'], 'old-pass', 'new-pass');
    expect(summary.rotated).toBe(1);
    expect(summary.failed).toBe(1);
  });
});

describe('getEncryptedKeys', () => {
  it('returns only keys with enc: prefix values', async () => {
    const env = await makeEncryptedEnv('pass');
    const keys = getEncryptedKeys(env);
    expect(keys).toContain('KEY_A');
    expect(keys).toContain('KEY_B');
    expect(keys).not.toContain('KEY_C');
  });
});
