import { formatLowercaseChange, formatLowercaseResult, formatLowercaseSummary } from '../lowercaseFormatter';
import type { LowercaseChange, LowercaseResult } from '../envLowercase';

const keyChange: LowercaseChange = { key: 'APP_NAME', before: 'APP_NAME', after: 'app_name', field: 'key' };
const valueChange: LowercaseChange = { key: 'DB_HOST', before: 'Localhost', after: 'localhost', field: 'value' };

const resultWithChanges: LowercaseResult = {
  original: { APP_NAME: 'MyApp', DB_HOST: 'Localhost' },
  result: { app_name: 'MyApp', db_host: 'Localhost' },
  changes: [keyChange, valueChange],
};

const resultNoChanges: LowercaseResult = {
  original: { foo: 'bar' },
  result: { foo: 'bar' },
  changes: [],
};

describe('formatLowercaseChange', () => {
  it('formats a key change', () => {
    const out = formatLowercaseChange(keyChange);
    expect(out).toContain('[key]');
    expect(out).toContain('APP_NAME');
    expect(out).toContain('app_name');
  });

  it('formats a value change', () => {
    const out = formatLowercaseChange(valueChange);
    expect(out).toContain('[value]');
    expect(out).toContain('Localhost');
    expect(out).toContain('localhost');
  });
});

describe('formatLowercaseResult', () => {
  it('returns no-change message when empty', () => {
    expect(formatLowercaseResult(resultNoChanges)).toBe('No changes made.');
  });

  it('lists all changes', () => {
    const out = formatLowercaseResult(resultWithChanges);
    expect(out).toContain('APP_NAME');
    expect(out).toContain('Localhost');
  });
});

describe('formatLowercaseSummary', () => {
  it('includes total and changed counts', () => {
    const out = formatLowercaseSummary(resultWithChanges);
    expect(out).toContain('Total keys: 2');
    expect(out).toContain('Changed: 2');
  });

  it('shows key and value change breakdown', () => {
    const out = formatLowercaseSummary(resultWithChanges);
    expect(out).toContain('Key changes: 1');
    expect(out).toContain('Value changes: 1');
  });

  it('omits zero-count fields', () => {
    const onlyKeys: LowercaseResult = { ...resultWithChanges, changes: [keyChange] };
    const out = formatLowercaseSummary(onlyKeys);
    expect(out).not.toContain('Value changes');
  });
});
