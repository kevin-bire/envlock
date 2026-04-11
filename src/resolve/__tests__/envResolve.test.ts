import * as fs from 'fs';
import * as path from 'path';
import { resolveEnvFiles } from '../envResolve';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('resolveEnvFiles', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('KEY1=value1\nKEY2=value2\n');
  });

  it('resolves keys from a single file', () => {
    const result = resolveEnvFiles(['.env']);
    expect(result.resolved).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    expect(result.sources['KEY1']).toBe('file');
  });

  it('later files overwrite earlier files', () => {
    mockFs.readFileSync
      .mockReturnValueOnce('KEY1=first\n')
      .mockReturnValueOnce('KEY1=second\n');
    const result = resolveEnvFiles(['.env', '.env.local']);
    expect(result.resolved['KEY1']).toBe('second');
  });

  it('applies overrides and records conflicts', () => {
    const result = resolveEnvFiles(['.env'], {
      overrides: { KEY1: 'overridden' },
    });
    expect(result.resolved['KEY1']).toBe('overridden');
    expect(result.sources['KEY1']).toBe('override');
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toMatchObject({
      key: 'KEY1',
      fileValue: 'value1',
      overrideValue: 'overridden',
    });
  });

  it('skips missing files unless strict mode', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(() => resolveEnvFiles(['.env'])).not.toThrow();
  });

  it('throws in strict mode when file is missing', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(() => resolveEnvFiles(['.env'], { strict: true })).toThrow(
      'File not found'
    );
  });

  it('detects empty values as missing', () => {
    mockFs.readFileSync.mockReturnValue('KEY1=\nKEY2=value2\n');
    const result = resolveEnvFiles(['.env']);
    expect(result.missing).toContain('KEY1');
    expect(result.missing).not.toContain('KEY2');
  });

  it('no conflicts when override matches existing value', () => {
    const result = resolveEnvFiles(['.env'], {
      overrides: { KEY1: 'value1' },
    });
    expect(result.conflicts).toHaveLength(0);
  });
});
