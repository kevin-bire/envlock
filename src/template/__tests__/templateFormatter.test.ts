import {
  maskTemplateValue,
  formatField,
  formatTemplateResult,
  formatTemplateSummary,
} from '../templateFormatter';
import { EnvTemplate } from '../envTemplate';

describe('maskTemplateValue', () => {
  it('returns empty string for undefined value', () => {
    expect(maskTemplateValue(undefined, false)).toBe('');
  });

  it('returns value as-is when not sensitive', () => {
    expect(maskTemplateValue('hello', false)).toBe('hello');
  });

  it('masks value when sensitive is true', () => {
    expect(maskTemplateValue('secret123', true)).toBe('****');
  });
});

describe('formatField', () => {
  it('formats a simple field without metadata', () => {
    const result = formatField('PORT', { type: 'number', required: false });
    expect(result).toContain('PORT=');
    expect(result).toContain('type:number');
  });

  it('includes description comment', () => {
    const result = formatField('HOST', { description: 'Server hostname', required: true });
    expect(result).toContain('# Server hostname');
    expect(result).toContain('required');
  });

  it('masks sensitive default values', () => {
    const result = formatField('SECRET', { sensitive: true, defaultValue: 'mysecret' }, true);
    expect(result).toContain('****');
    expect(result).not.toContain('mysecret');
  });

  it('shows sensitive default values when masking disabled', () => {
    const result = formatField('SECRET', { sensitive: true, defaultValue: 'mysecret' }, false);
    expect(result).toContain('mysecret');
  });
});

describe('formatTemplateResult', () => {
  const template: EnvTemplate = {
    description: 'App configuration',
    fields: {
      PORT: { type: 'number', required: true, defaultValue: '3000' },
      API_KEY: { sensitive: true, required: true },
      DEBUG: { type: 'boolean', required: false, defaultValue: 'false' },
    },
  };

  it('includes the template description', () => {
    const result = formatTemplateResult(template);
    expect(result).toContain('# App configuration');
  });

  it('includes all field keys', () => {
    const result = formatTemplateResult(template);
    expect(result).toContain('PORT=');
    expect(result).toContain('API_KEY=');
    expect(result).toContain('DEBUG=');
  });

  it('separates fields with blank lines', () => {
    const result = formatTemplateResult(template);
    expect(result).toContain('\n\n');
  });
});

describe('formatTemplateSummary', () => {
  it('returns correct counts', () => {
    const template: EnvTemplate = {
      fields: {
        A: { required: true, sensitive: true, defaultValue: 'x' },
        B: { required: true },
        C: { required: false },
      },
    };
    const summary = formatTemplateSummary(template);
    expect(summary).toContain('Total fields : 3');
    expect(summary).toContain('Required     : 2');
    expect(summary).toContain('Sensitive    : 1');
    expect(summary).toContain('With defaults: 1');
  });
});
