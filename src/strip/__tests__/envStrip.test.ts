import {
  stripByKeys,
  stripByPatterns,
  stripEmptyValues,
  stripEnv,
} from '../envStrip';
import { formatStripResult, formatStripSummary } from '../stripFormatter';

const sampleEnv = {
  API_KEY: 'secret',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DEBUG: '',
  APP_NAME: 'envlock',
  EMPTY_VAR: '',
};

describe('stripByKeys', () => {
  it('removes specified keys', () => {
    const removed = stripByKeys(sampleEnv, ['API_KEY', 'DEBUG']);
    expect(removed).toContain('API_KEY');
    expect(removed).toContain('DEBUG');
    expect(removed).not.toContain('DB_HOST');
  });

  it('is case-insensitive', () => {
    const removed = stripByKeys(sampleEnv, ['api_key']);
    expect(removed).toContain('API_KEY');
  });

  it('returns empty array when no keys match', () => {
    const removed = stripByKeys(sampleEnv, ['NONEXISTENT']);
    expect(removed).toHaveLength(0);
  });
});

describe('stripByPatterns', () => {
  it('removes keys matching pattern', () => {
    const removed = stripByPatterns(sampleEnv, [/^DB_/]);
    expect(removed).toContain('DB_HOST');
    expect(removed).toContain('DB_PORT');
    expect(removed).not.toContain('API_KEY');
  });

  it('supports multiple patterns', () => {
    const removed = stripByPatterns(sampleEnv, [/^DB_/, /^APP_/]);
    expect(removed).toContain('DB_HOST');
    expect(removed).toContain('APP_NAME');
  });
});

describe('stripEmptyValues', () => {
  it('removes keys with empty string values', () => {
    const removed = stripEmptyValues(sampleEnv);
    expect(removed).toContain('DEBUG');
    expect(removed).toContain('EMPTY_VAR');
    expect(removed).not.toContain('API_KEY');
  });
});

describe('stripEnv', () => {
  it('strips by keys option', () => {
    const result = stripEnv(sampleEnv, { keys: ['API_KEY'] });
    expect(result.removedKeys).toContain('API_KEY');
    expect(result.stripped).not.toHaveProperty('API_KEY');
    expect(result.removedCount).toBe(1);
  });

  it('strips by patterns option', () => {
    const result = stripEnv(sampleEnv, { patterns: [/^DB_/] });
    expect(result.stripped).not.toHaveProperty('DB_HOST');
    expect(result.stripped).not.toHaveProperty('DB_PORT');
  });

  it('strips empty values when flag is set', () => {
    const result = stripEnv(sampleEnv, { emptyValues: true });
    expect(result.stripped).not.toHaveProperty('DEBUG');
    expect(result.stripped).not.toHaveProperty('EMPTY_VAR');
  });

  it('combines multiple options', () => {
    const result = stripEnv(sampleEnv, { keys: ['API_KEY'], emptyValues: true });
    expect(result.removedCount).toBe(3);
  });

  it('returns original unchanged', () => {
    const result = stripEnv(sampleEnv, { keys: ['API_KEY'] });
    expect(result.original).toHaveProperty('API_KEY');
  });

  it('returns empty removedKeys when no options given', () => {
    const result = stripEnv(sampleEnv, {});
    expect(result.removedCount).toBe(0);
    expect(result.stripped).toEqual(sampleEnv);
  });
});

describe('formatStripResult', () => {
  it('shows message when nothing stripped', () => {
    const result = stripEnv(sampleEnv, {});
    expect(formatStripResult(result)).toContain('No keys were stripped');
  });

  it('lists removed keys', () => {
    const result = stripEnv(sampleEnv, { keys: ['API_KEY'] });
    expect(formatStripResult(result)).toContain('API_KEY');
  });
});

describe('formatStripSummary', () => {
  it('shows counts', () => {
    const result = stripEnv(sampleEnv, { keys: ['API_KEY'] });
    const summary = formatStripSummary(result);
    expect(summary).toContain('Stripped');
    expect(summary).toContain('Remaining');
  });
});
