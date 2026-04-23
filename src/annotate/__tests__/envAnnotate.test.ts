import { annotateKeys, serializeAnnotated, stripAnnotations } from '../envAnnotate';

describe('annotateKeys', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', API_KEY: 'secret' };

  it('annotates keys that exist in env', () => {
    const result = annotateKeys(env, { DB_HOST: 'Database hostname', API_KEY: 'API credentials' });
    expect(result.annotations).toHaveLength(2);
    expect(result.annotations[0]).toEqual({ key: 'DB_HOST', comment: 'Database hostname' });
    expect(result.annotations[1]).toEqual({ key: 'API_KEY', comment: 'API credentials' });
    expect(result.skipped).toHaveLength(0);
  });

  it('skips keys not present in env', () => {
    const result = annotateKeys(env, { MISSING_KEY: 'some comment' });
    expect(result.annotations).toHaveLength(0);
    expect(result.skipped).toContain('MISSING_KEY');
  });

  it('handles mix of found and missing keys', () => {
    const result = annotateKeys(env, { DB_PORT: 'Port number', UNKNOWN: 'nope' });
    expect(result.annotations).toHaveLength(1);
    expect(result.skipped).toEqual(['UNKNOWN']);
  });

  it('returns empty result for empty annotations', () => {
    const result = annotateKeys(env, {});
    expect(result.annotations).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('serializeAnnotated', () => {
  it('writes comment lines before annotated keys', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const annotated = { DB_HOST: 'Database hostname' };
    const output = serializeAnnotated(env, annotated);
    expect(output).toContain('# Database hostname');
    expect(output).toContain('DB_HOST=localhost');
    expect(output).toContain('DB_PORT=5432');
    const hostIdx = output.indexOf('# Database hostname');
    const keyIdx = output.indexOf('DB_HOST=localhost');
    expect(hostIdx).toBeLessThan(keyIdx);
  });

  it('does not add comment for unannotated keys', () => {
    const env = { FOO: 'bar' };
    const output = serializeAnnotated(env, {});
    expect(output).not.toContain('#');
    expect(output).toContain('FOO=bar');
  });
});

describe('stripAnnotations', () => {
  it('returns keys from annotated record', () => {
    const annotated = { DB_HOST: 'comment', API_KEY: 'another' };
    expect(stripAnnotations(annotated)).toEqual(['DB_HOST', 'API_KEY']);
  });

  it('returns empty array for empty input', () => {
    expect(stripAnnotations({})).toEqual([]);
  });
});
