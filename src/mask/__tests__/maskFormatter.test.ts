import { formatMaskedEntry, formatMaskResult, formatMaskSummary } from '../maskFormatter';
import { MaskResult } from '../envMask';

describe('formatMaskedEntry', () => {
  it('formats a masked entry with indicator', () => {
    const result = formatMaskedEntry('DB_PASSWORD', 'secret', '********', true);
    expect(result).toContain('DB_PASSWORD=********');
    expect(result).toContain('(masked)');
  });

  it('formats a plain entry without indicator', () => {
    const result = formatMaskedEntry('PORT', '3000', '3000', false);
    expect(result).toContain('PORT=3000');
    expect(result).not.toContain('(masked)');
  });
});

describe('formatMaskResult', () => {
  const original = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'secret123',
    PORT: '3000',
  };

  const result: MaskResult = {
    masked: {
      APP_NAME: 'myapp',
      DB_PASSWORD: '********',
      PORT: '3000',
    },
    maskedKeys: ['DB_PASSWORD'],
  };

  it('includes all keys in output', () => {
    const output = formatMaskResult(original, result);
    expect(output).toContain('APP_NAME=myapp');
    expect(output).toContain('DB_PASSWORD=********');
    expect(output).toContain('PORT=3000');
  });

  it('marks masked keys with indicator', () => {
    const output = formatMaskResult(original, result);
    const lines = output.split('\n');
    const passwordLine = lines.find((l) => l.includes('DB_PASSWORD'));
    expect(passwordLine).toContain('(masked)');
  });
});

describe('formatMaskSummary', () => {
  it('shows correct counts', () => {
    const result: MaskResult = {
      masked: { A: '1', B: '2', C: '3' },
      maskedKeys: ['B'],
    };
    const output = formatMaskSummary(result);
    expect(output).toContain('Total keys : 3');
    expect(output).toContain('Masked     : 1');
    expect(output).toContain('Plain      : 2');
    expect(output).toContain('B');
  });

  it('omits masked keys line when nothing masked', () => {
    const result: MaskResult = {
      masked: { A: '1' },
      maskedKeys: [],
    };
    const output = formatMaskSummary(result);
    expect(output).not.toContain('Masked keys:');
  });
});
