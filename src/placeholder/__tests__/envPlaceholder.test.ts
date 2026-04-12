import { detectPlaceholders, fillPlaceholders } from '../envPlaceholder';

describe('detectPlaceholders', () => {
  it('detects keys containing placeholders', () => {
    const env = {
      HOST: '{{DB_HOST}}',
      PORT: '5432',
      URL: 'https://{{DOMAIN}}/api',
    };
    const detected = detectPlaceholders(env);
    expect(detected).toContain('HOST');
    expect(detected).toContain('URL');
    expect(detected).not.toContain('PORT');
  });

  it('returns empty array when no placeholders exist', () => {
    const env = { KEY: 'value', OTHER: 'plain' };
    expect(detectPlaceholders(env)).toHaveLength(0);
  });

  it('supports custom prefix/suffix', () => {
    const env = { KEY: '${VAR}' };
    const detected = detectPlaceholders(env, '${', '}');
    expect(detected).toContain('KEY');
  });
});

describe('fillPlaceholders', () => {
  it('replaces placeholders with provided values', () => {
    const env = { URL: 'https://{{HOST}}/path' };
    const values = { HOST: 'example.com' };
    const result = fillPlaceholders(env, values);
    expect(result.filled['URL']).toBe('https://example.com/path');
    expect(result.replaced).toContain('URL');
  });

  it('tracks missing placeholders', () => {
    const env = { URL: 'https://{{HOST}}/{{PATH}}' };
    const values = { HOST: 'example.com' };
    const result = fillPlaceholders(env, values);
    expect(result.missing).toContain('PATH');
    expect(result.skipped).toContain('URL');
  });

  it('replaces multiple placeholders in one value', () => {
    const env = { DSN: '{{USER}}:{{PASS}}@{{HOST}}' };
    const values = { USER: 'admin', PASS: 'secret', HOST: 'db.local' };
    const result = fillPlaceholders(env, values);
    expect(result.filled['DSN']).toBe('admin:secret@db.local');
    expect(result.replaced).toContain('DSN');
  });

  it('leaves non-placeholder keys unchanged', () => {
    const env = { KEY: 'plain', OTHER: '{{MISSING}}' };
    const values = {};
    const result = fillPlaceholders(env, values);
    expect(result.filled['KEY']).toBe('plain');
    expect(result.replaced).not.toContain('KEY');
  });

  it('supports custom prefix/suffix', () => {
    const env = { KEY: '${VAR}' };
    const values = { VAR: 'hello' };
    const result = fillPlaceholders(env, values, { prefix: '${', suffix: '}' });
    expect(result.filled['KEY']).toBe('hello');
    expect(result.replaced).toContain('KEY');
  });
});
