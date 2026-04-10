import {
  exportEnv,
  toJson,
  toYaml,
  toDotenv,
  maskExportValue,
  ExportOptions,
} from '../envExport';
import { formatExportSummary, buildExportSummary, formatExportPreview } from '../exportFormatter';

const sampleEnv = {
  APP_NAME: 'envlock',
  API_KEY: 'supersecret123',
  PORT: '3000',
  DB_PASSWORD: 'pass123',
};

const baseOptions: ExportOptions = { format: 'json', maskSecrets: false };

describe('maskExportValue', () => {
  const pattern = /secret|password|token|key|api/i;
  it('masks values matching the pattern', () => {
    expect(maskExportValue('API_KEY', 'secret', pattern)).toBe('***');
  });
  it('does not mask non-secret keys', () => {
    expect(maskExportValue('PORT', '3000', pattern)).toBe('3000');
  });
});

describe('toJson', () => {
  it('exports env as JSON', () => {
    const result = toJson(sampleEnv, baseOptions);
    const parsed = JSON.parse(result);
    expect(parsed.APP_NAME).toBe('envlock');
    expect(parsed.PORT).toBe('3000');
  });

  it('masks secrets when maskSecrets is true', () => {
    const result = toJson(sampleEnv, { ...baseOptions, maskSecrets: true });
    const parsed = JSON.parse(result);
    expect(parsed.API_KEY).toBe('***');
    expect(parsed.APP_NAME).toBe('envlock');
  });
});

describe('toYaml', () => {
  it('exports env as YAML', () => {
    const result = toYaml(sampleEnv, { ...baseOptions, format: 'yaml' });
    expect(result).toContain('APP_NAME: "envlock"');
    expect(result).toContain('PORT: "3000"');
  });
});

describe('toDotenv', () => {
  it('exports env in dotenv format', () => {
    const result = toDotenv(sampleEnv, { ...baseOptions, format: 'dotenv' });
    expect(result).toContain('APP_NAME=envlock');
    expect(result).toContain('PORT=3000');
  });
});

describe('exportEnv', () => {
  it('routes to correct format handler', () => {
    const json = exportEnv(sampleEnv, { format: 'json' });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('throws on unsupported format', () => {
    expect(() => exportEnv(sampleEnv, { format: 'xml' as any })).toThrow();
  });
});

describe('formatExportSummary', () => {
  it('formats summary correctly', () => {
    const summary = buildExportSummary(sampleEnv, 'json', /secret|password|token|key|api/i, true, 'out.json');
    const output = formatExportSummary(summary);
    expect(output).toContain('JSON');
    expect(output).toContain('out.json');
    expect(output).toContain('Masked Keys');
  });
});

describe('formatExportPreview', () => {
  it('truncates long content', () => {
    const content = Array.from({ length: 20 }, (_, i) => `KEY_${i}=val`).join('\n');
    const preview = formatExportPreview(content, 5);
    expect(preview).toContain('more lines');
  });

  it('shows full content when within limit', () => {
    const content = 'A=1\nB=2';
    expect(formatExportPreview(content, 10)).toBe(content);
  });
});
