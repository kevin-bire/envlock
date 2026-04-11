import { normalizeEnv } from '../envNormalize';
import { formatNormalizeResult, formatNormalizeSummary } from '../normalizeFormatter';

const sampleEnv = {
  api_key: '  MySecret  ',
  DB_HOST: 'Localhost',
  EMPTY_VAR: '',
  app_name: 'MyApp',
};

describe('normalizeEnv', () => {
  it('returns unchanged env when no options set', () => {
    const result = normalizeEnv(sampleEnv);
    expect(result.changes).toHaveLength(0);
    expect(result.removedKeys).toHaveLength(0);
    expect(result.env).toEqual(sampleEnv);
  });

  it('uppercases keys', () => {
    const result = normalizeEnv({ api_key: 'value' }, { uppercaseKeys: true });
    expect(result.env).toHaveProperty('API_KEY', 'value');
    expect(result.changes[0].reason).toBe('uppercased key');
  });

  it('trims values', () => {
    const result = normalizeEnv({ KEY: '  hello  ' }, { trimValues: true });
    expect(result.env['KEY']).toBe('hello');
    expect(result.changes[0].reason).toBe('trimmed value');
  });

  it('lowercases values', () => {
    const result = normalizeEnv({ KEY: 'HELLO' }, { lowercaseValues: true });
    expect(result.env['KEY']).toBe('hello');
    expect(result.changes[0].reason).toBe('lowercased value');
  });

  it('removes empty keys when removeEmpty is true', () => {
    const result = normalizeEnv({ KEY: '', OTHER: 'val' }, { removeEmpty: true });
    expect(result.removedKeys).toContain('KEY');
    expect(result.env).not.toHaveProperty('KEY');
    expect(result.env).toHaveProperty('OTHER', 'val');
  });

  it('applies custom replacer', () => {
    const result = normalizeEnv(
      { SECRET: 'plain' },
      { replacer: (_k, v) => v.toUpperCase() }
    );
    expect(result.env['SECRET']).toBe('PLAIN');
    expect(result.changes[0].reason).toBe('custom replacer');
  });

  it('applies multiple options together', () => {
    const result = normalizeEnv(
      { my_key: '  Value  ', empty: '' },
      { uppercaseKeys: true, trimValues: true, removeEmpty: true }
    );
    expect(result.env).toHaveProperty('MY_KEY', 'Value');
    expect(result.removedKeys).toContain('EMPTY');
  });
});

describe('formatNormalizeResult', () => {
  it('returns no-change message when nothing changed', () => {
    const result = normalizeEnv({ KEY: 'val' });
    expect(formatNormalizeResult(result)).toContain('No normalization changes');
  });

  it('lists changes and removed keys', () => {
    const result = normalizeEnv(
      { key: 'val', empty: '' },
      { uppercaseKeys: true, removeEmpty: true }
    );
    const output = formatNormalizeResult(result);
    expect(output).toContain('Normalized entries:');
    expect(output).toContain('Removed empty keys:');
  });
});

describe('formatNormalizeSummary', () => {
  it('outputs summary counts', () => {
    const result = normalizeEnv(
      { key: 'val', empty: '' },
      { uppercaseKeys: true, removeEmpty: true }
    );
    const summary = formatNormalizeSummary(result);
    expect(summary).toContain('Total keys');
    expect(summary).toContain('Changed');
    expect(summary).toContain('Removed');
  });
});
