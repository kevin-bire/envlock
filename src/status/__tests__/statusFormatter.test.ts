import {
  formatStatusEntry,
  formatStatusResult,
  formatStatusSummary,
} from '../statusFormatter';
import { EnvStatus } from '../envStatus';

const mockStatus: EnvStatus = {
  file: '.env',
  environment: 'development',
  present: ['DB_HOST', 'DB_PORT'],
  missing: ['API_KEY'],
  extra: ['DEBUG'],
};

describe('formatStatusEntry', () => {
  it('formats an ok entry with checkmark', () => {
    const result = formatStatusEntry('DB_HOST', 'ok');
    expect(result).toContain('✔');
    expect(result).toContain('DB_HOST');
    expect(result).toContain('[ok]');
  });

  it('formats a missing entry with cross', () => {
    const result = formatStatusEntry('API_KEY', 'missing');
    expect(result).toContain('✘');
    expect(result).toContain('API_KEY');
    expect(result).toContain('[missing]');
  });

  it('formats an extra entry with tilde', () => {
    const result = formatStatusEntry('DEBUG', 'extra');
    expect(result).toContain('~');
    expect(result).toContain('DEBUG');
    expect(result).toContain('[extra]');
  });

  it('includes value when provided', () => {
    const result = formatStatusEntry('DB_HOST', 'ok', 'localhost');
    expect(result).toContain('= localhost');
  });
});

describe('formatStatusResult', () => {
  it('includes file and environment', () => {
    const output = formatStatusResult(mockStatus);
    expect(output).toContain('.env');
    expect(output).toContain('development');
  });

  it('lists present keys under Present section', () => {
    const output = formatStatusResult(mockStatus);
    expect(output).toContain('Present:');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('DB_PORT');
  });

  it('lists missing keys under Missing section', () => {
    const output = formatStatusResult(mockStatus);
    expect(output).toContain('Missing:');
    expect(output).toContain('API_KEY');
  });

  it('lists extra keys under Extra section', () => {
    const output = formatStatusResult(mockStatus);
    expect(output).toContain('Extra');
    expect(output).toContain('DEBUG');
  });

  it('omits sections when empty', () => {
    const clean: EnvStatus = { file: '.env', environment: 'prod', present: ['X'], missing: [], extra: [] };
    const output = formatStatusResult(clean);
    expect(output).not.toContain('Missing:');
    expect(output).not.toContain('Extra');
  });
});

describe('formatStatusSummary', () => {
  it('shows correct counts', () => {
    const output = formatStatusSummary(mockStatus);
    expect(output).toContain('Present    : 2');
    expect(output).toContain('Missing    : 1');
    expect(output).toContain('Extra      : 1');
  });

  it('shows OK status when no missing keys', () => {
    const clean: EnvStatus = { file: '.env', environment: 'prod', present: ['X'], missing: [], extra: [] };
    const output = formatStatusSummary(clean);
    expect(output).toContain('✔ OK');
  });

  it('shows issues found when missing keys exist', () => {
    const output = formatStatusSummary(mockStatus);
    expect(output).toContain('✘ Issues found');
  });
});
