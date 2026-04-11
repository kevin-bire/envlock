/**
 * Encryption module for envlock.
 * Provides utilities for encrypting and decrypting environment variables
 * using AES-256-GCM with PBKDF2 key derivation.
 */
export { encryptValue, decryptValue, encryptEnv, decryptEnv, deriveKey } from './envEncrypt';
