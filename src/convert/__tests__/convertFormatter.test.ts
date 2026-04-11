import {
  formatConvertSummary,
  formatConvertResult,
  formatSupportedFormats,
} from '../convertFormatter';
import { ConvertResult } from '../envConvert';

const mockResult: ConvertResult = {
  format: 'json',
  output: '{\n  "KEY": "value",\n  "PORT": "3000"\n}',
  keyCount: 2,
};

describe('formatConvertSummary', () => {
  it('includes key count and format', () => {
    const out = formatConvertSummary(mockResult);
    expect(out).toContain('2 key(s)');
    expect(out).toContain('JSON');
  });

  it('includes source file when provided', () => {
    const out = formatConvertSummary(mockResult, '.env.production');
    expect(out).toContain('.env.production');
  });

  it('omits source when not provided', () => {
    const out = formatConvertSummary(mockResult);
    expect(out).not.toContain('Source:');
  });
});

describe('formatConvertResult', () => {
  it('includes format header', () => {
    const out = formatConvertResult(mockResult);
    expect(out).toContain('[JSON]');
    expect(out).toContain('2 keys');
  });

  it('shows full output when preview is false', () => {
    const out = formatConvertResult(mockResult, false);
    expect(out).toContain('"KEY": "value"');
  });

  it('truncates output in preview mode', () => {
    const longResult: ConvertResult = {
      format: 'yaml',
      output: Array.from({ length: 10 }, (_, i) => `KEY${i}: "val${i}"`).join('\n'),
      keyCount: 10,
    };
    const out = formatConvertResult(longResult, true);
    expect(out).toContain('... (truncated)');
  });

  it('does not truncate short output in preview mode', () => {
    const out = formatConvertResult(mockResult, true);
    expect(out).not.toContain('... (truncated)');
  });
});

describe('formatSupportedFormats', () => {
  it('lists all formats in uppercase', () => {
    const out = formatSupportedFormats(['json', 'yaml', 'shell', 'dotenv']);
    expect(out).toContain('JSON');
    expect(out).toContain('YAML');
    expect(out).toContain('SHELL');
    expect(out).toContain('DOTENV');
  });
});
