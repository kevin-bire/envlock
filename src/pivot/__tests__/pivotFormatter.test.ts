import { formatPivotEntry, formatPivotResult, formatPivotSummary } from '../pivotFormatter';
import { PivotResult } from '../envPivot';

const sampleResult: PivotResult = {
  environments: ['dev', 'prod'],
  keys: ['DB_HOST', 'API_KEY', 'TIMEOUT'],
  pivot: {
    DB_HOST: { dev: 'localhost', prod: 'db.prod.com' },
    API_KEY: { dev: 'dev-key', prod: 'dev-key' },
    TIMEOUT: { dev: '30' },
  },
};

describe('formatPivotEntry', () => {
  it('formats a single pivot entry with multiple environments', () => {
    const result = formatPivotEntry('DB_HOST', { dev: 'localhost', prod: 'db.prod.com' });
    expect(result).toContain('[DB_HOST]');
    expect(result).toContain('dev: localhost');
    expect(result).toContain('prod: db.prod.com');
  });

  it('formats an entry with a single environment', () => {
    const result = formatPivotEntry('TIMEOUT', { dev: '30' });
    expect(result).toContain('[TIMEOUT]');
    expect(result).toContain('dev: 30');
  });

  it('formats an entry with no environments', () => {
    const result = formatPivotEntry('EMPTY', {});
    expect(result).toContain('[EMPTY]');
  });
});

describe('formatPivotResult', () => {
  it('includes environments in output', () => {
    const output = formatPivotResult(sampleResult);
    expect(output).toContain('dev, prod');
  });

  it('includes key count', () => {
    const output = formatPivotResult(sampleResult);
    expect(output).toContain('Keys         : 3');
  });

  it('includes each key as a section', () => {
    const output = formatPivotResult(sampleResult);
    expect(output).toContain('[DB_HOST]');
    expect(output).toContain('[API_KEY]');
    expect(output).toContain('[TIMEOUT]');
  });

  it('shows values per environment', () => {
    const output = formatPivotResult(sampleResult);
    expect(output).toContain('prod: db.prod.com');
  });
});

describe('formatPivotSummary', () => {
  it('reports total key count', () => {
    const output = formatPivotSummary(sampleResult);
    expect(output).toContain('Total keys   : 3');
  });

  it('identifies consistent keys', () => {
    const output = formatPivotSummary(sampleResult);
    // API_KEY has same value in both envs
    expect(output).toContain('Consistent   : 1');
  });

  it('identifies inconsistent keys', () => {
    const output = formatPivotSummary(sampleResult);
    // DB_HOST differs between dev and prod
    expect(output).toContain('Inconsistent : 1');
  });

  it('identifies keys with missing values', () => {
    const output = formatPivotSummary(sampleResult);
    // TIMEOUT is only in dev, missing prod
    expect(output).toContain('Missing vals : 1');
  });
});
