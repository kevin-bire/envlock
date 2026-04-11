import { detectType, tokenizeEnv } from '../envTokenize';
import { formatTokenEntry, formatTokenizeResult, formatTokenizeSummary } from '../tokenizeFormatter';

describe('detectType', () => {
  it('detects string values', () => {
    expect(detectType('hello')).toBe('string');
    expect(detectType('my-app')).toBe('string');
  });

  it('detects number values', () => {
    expect(detectType('42')).toBe('number');
    expect(detectType('3.14')).toBe('number');
    expect(detectType('-7')).toBe('number');
  });

  it('detects boolean values', () => {
    expect(detectType('true')).toBe('boolean');
    expect(detectType('false')).toBe('boolean');
    expect(detectType('yes')).toBe('boolean');
    expect(detectType('no')).toBe('boolean');
  });

  it('detects null values', () => {
    expect(detectType('')).toBe('null');
    expect(detectType('null')).toBe('null');
    expect(detectType('none')).toBe('null');
  });

  it('detects url values', () => {
    expect(detectType('https://example.com')).toBe('url');
    expect(detectType('http://localhost:3000')).toBe('url');
  });

  it('detects path values', () => {
    expect(detectType('/usr/local/bin')).toBe('path');
    expect(detectType('./config/file')).toBe('path');
    expect(detectType('../relative/path')).toBe('path');
  });

  it('detects json values', () => {
    expect(detectType('{"key":"value"}')).toBe('json');
    expect(detectType('[1,2,3]')).toBe('json');
  });
});

describe('tokenizeEnv', () => {
  it('tokenizes a parsed env object', () => {
    const env = {
      PORT: '3000',
      DEBUG: 'true',
      API_URL: 'https://api.example.com',
      DB_PATH: '/var/db/data',
      APP_NAME: 'myapp',
    };
    const result = tokenizeEnv(env);
    expect(result.entries).toHaveLength(5);
    expect(result.typeCounts.number).toBe(1);
    expect(result.typeCounts.boolean).toBe(1);
    expect(result.typeCounts.url).toBe(1);
    expect(result.typeCounts.path).toBe(1);
    expect(result.typeCounts.string).toBe(1);
  });

  it('returns empty result for empty env', () => {
    const result = tokenizeEnv({});
    expect(result.entries).toHaveLength(0);
  });
});

describe('formatTokenEntry', () => {
  it('formats an entry without color', () => {
    const entry = { key: 'PORT', value: '3000', type: 'number' as const };
    const formatted = formatTokenEntry(entry, true);
    expect(formatted).toContain('PORT=3000');
    expect(formatted).toContain('[NUMBER]');
  });
});

describe('formatTokenizeResult', () => {
  it('returns message for empty result', () => {
    const result = formatTokenizeResult({ entries: [], typeCounts: { string: 0, number: 0, boolean: 0, null: 0, url: 0, path: 0, json: 0 } }, true);
    expect(result).toBe('No entries to tokenize.');
  });
});

describe('formatTokenizeSummary', () => {
  it('summarizes tokenize result', () => {
    const env = { PORT: '8080', DEBUG: 'true' };
    const result = tokenizeEnv(env);
    const summary = formatTokenizeSummary(result);
    expect(summary).toContain('2 entries');
    expect(summary).toContain('number');
    expect(summary).toContain('boolean');
  });
});
