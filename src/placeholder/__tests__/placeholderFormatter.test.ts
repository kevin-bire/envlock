import {
  formatReplacedEntry,
  formatSkippedEntry,
  formatMissingPlaceholder,
  formatPlaceholderResult,
  formatPlaceholderSummary,
} from '../placeholderFormatter';
import { PlaceholderResult } from '../envPlaceholder';

describe('formatReplacedEntry', () => {
  it('formats a replaced key with before/after values', () => {
    const line = formatReplacedEntry('URL', '{{HOST}}/path', 'example.com/path');
    expect(line).toContain('URL');
    expect(line).toContain('{{HOST}}/path');
    expect(line).toContain('example.com/path');
    expect(line).toContain('✔');
  });
});

describe('formatSkippedEntry', () => {
  it('formats a skipped key with reason', () => {
    const line = formatSkippedEntry('HOST', 'missing replacement');
    expect(line).toContain('HOST');
    expect(line).toContain('missing replacement');
    expect(line).toContain('⚠');
  });
});

describe('formatMissingPlaceholder', () => {
  it('formats a missing placeholder name', () => {
    const line = formatMissingPlaceholder('DB_HOST');
    expect(line).toContain('{{DB_HOST}}');
    expect(line).toContain('✘');
  });
});

describe('formatPlaceholderResult', () => {
  it('includes replaced, skipped, and missing sections', () => {
    const result: PlaceholderResult = {
      filled: { URL: 'https://example.com' },
      replaced: ['URL'],
      skipped: ['DSN'],
      missing: ['UNKNOWN'],
    };
    const original = { URL: 'https://{{HOST}}', DSN: '{{USER}}@{{UNKNOWN}}' };
    const output = formatPlaceholderResult(result, original);
    expect(output).toContain('Replaced');
    expect(output).toContain('Skipped');
    expect(output).toContain('Missing');
    expect(output).toContain('URL');
    expect(output).toContain('UNKNOWN');
  });

  it('omits sections with no entries', () => {
    const result: PlaceholderResult = {
      filled: { KEY: 'val' },
      replaced: [],
      skipped: [],
      missing: [],
    };
    const output = formatPlaceholderResult(result, { KEY: 'val' });
    expect(output).not.toContain('Replaced');
    expect(output).not.toContain('Skipped');
    expect(output).not.toContain('Missing');
  });
});

describe('formatPlaceholderSummary', () => {
  it('returns a summary line with counts', () => {
    const result: PlaceholderResult = {
      filled: {},
      replaced: ['A', 'B'],
      skipped: ['C'],
      missing: ['X'],
    };
    const summary = formatPlaceholderSummary(result);
    expect(summary).toContain('2 replaced');
    expect(summary).toContain('1 skipped');
    expect(summary).toContain('1 missing');
  });
});
