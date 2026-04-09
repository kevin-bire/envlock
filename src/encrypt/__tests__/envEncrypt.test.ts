import {
  encryptValue,
  decryptValue,
  encryptEnv,
  decryptEnv,
} from '../envEncrypt';

const SECRET = 'super-secret-test-key';

describe('encryptValue / decryptValue', () => {
  it('should encrypt and decrypt a value round-trip', () => {
    const original = 'my-database-password';
    const encrypted = encryptValue(original, SECRET);
    expect(encrypted).not.toBe(original);
    const decrypted = decryptValue(encrypted, SECRET);
    expect(decrypted).toBe(original);
  });

  it('should produce different ciphertexts for the same input (random IV)', () => {
    const value = 'same-value';
    const enc1 = encryptValue(value, SECRET);
    const enc2 = encryptValue(value, SECRET);
    expect(enc1).not.toBe(enc2);
  });

  it('should throw when decrypting with wrong secret', () => {
    const encrypted = encryptValue('sensitive', SECRET);
    expect(() => decryptValue(encrypted, 'wrong-secret')).toThrow();
  });

  it('should throw on invalid ciphertext', () => {
    expect(() => decryptValue('tooshort', SECRET)).toThrow(
      'Invalid ciphertext: too short'
    );
  });
});

describe('encryptEnv', () => {
  const env = { DB_PASS: 'secret', API_KEY: 'key123', PORT: '3000' };

  it('should encrypt all values by default', () => {
    const result = encryptEnv(env, SECRET);
    expect(result.DB_PASS).toMatch(/^enc:/);
    expect(result.API_KEY).toMatch(/^enc:/);
    expect(result.PORT).toMatch(/^enc:/);
  });

  it('should only encrypt specified keys', () => {
    const result = encryptEnv(env, SECRET, ['DB_PASS']);
    expect(result.DB_PASS).toMatch(/^enc:/);
    expect(result.API_KEY).toBe('key123');
    expect(result.PORT).toBe('3000');
  });

  it('should not mutate the original env object', () => {
    encryptEnv(env, SECRET);
    expect(env.DB_PASS).toBe('secret');
  });
});

describe('decryptEnv', () => {
  it('should decrypt only enc: prefixed values', () => {
    const env = {
      DB_PASS: `enc:${encryptValue('secret', SECRET)}`,
      PORT: '3000',
    };
    const result = decryptEnv(env, SECRET);
    expect(result.DB_PASS).toBe('secret');
    expect(result.PORT).toBe('3000');
  });

  it('should round-trip encryptEnv -> decryptEnv', () => {
    const original = { DB_PASS: 'pass', API_KEY: 'key', NODE_ENV: 'production' };
    const encrypted = encryptEnv(original, SECRET);
    const decrypted = decryptEnv(encrypted, SECRET);
    expect(decrypted).toEqual(original);
  });
});
