import {
  formatRedactedEntry,
  formatRedactResult,
  formatRedactSummary,
  RedactResult,
} from '../redactFormatter';

const mockResult: RedactResult = {
  original: {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'secret123',
    API_KEY: 'abc-xyz',
    PORT: '3000',
  },
  redacted: {
    APP_NAME: 'myapp',
    DB_PASSWORD: '[REDACTED]',
    API_KEY: '[REDACTED]',
    PORT: '3000',
  },
  redactedKeys: ['DB_PASSWORD', 'API_KEY'],
};

describe('formatRedactedEntry', () => {
  it('formats a redacted entry with [REDACTED] label', () => {
    const result = formatRedactedEntry('DB_PASSWORD', '[REDACTED]', true);
    expect(result).toBe('  DB_PASSWORD: [REDACTED]');
  });

  it('formats a plain entry without label', () => {
    const result = formatRedactedEntry('APP_NAME', 'myapp', false);
    expect(result).toBe('  APP_NAME: myapp');
  });
});

describe('formatRedactResult', () => {
  it('includes header line', () => {
    const output = formatRedactResult(mockResult);
    expect(output).toContain('Redacted Environment:');
  });

  it('shows redacted keys with [REDACTED]', () => {
    const output = formatRedactResult(mockResult);
    expect(output).toContain('DB_PASSWORD: [REDACTED]');
    expect(output).toContain('API_KEY: [REDACTED]');
  });

  it('shows plain keys with their values', () => {
    const output = formatRedactResult(mockResult);
    expect(output).toContain('APP_NAME: myapp');
    expect(output).toContain('PORT: 3000');
  });
});

describe('formatRedactSummary', () => {
  it('shows total, redacted, and kept counts', () => {
    const output = formatRedactSummary(mockResult);
    expect(output).toContain('Total keys : 4');
    expect(output).toContain('Redacted   : 2');
    expect(output).toContain('Kept plain : 2');
  });

  it('lists each redacted key', () => {
    const output = formatRedactSummary(mockResult);
    expect(output).toContain('- DB_PASSWORD');
    expect(output).toContain('- API_KEY');
  });

  it('omits key list when nothing was redacted', () => {
    const emptyResult: RedactResult = {
      original: { PORT: '3000' },
      redacted: { PORT: '3000' },
      redactedKeys: [],
    };
    const output = formatRedactSummary(emptyResult);
    expect(output).not.toContain('Keys redacted:');
    expect(output).toContain('Redacted   : 0');
  });
});
