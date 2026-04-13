import {
  formatTransformChange,
  formatTransformResult,
  formatTransformSummary,
} from '../transformFormatter';
import { TransformResult } from '../envTransform';

const makeResult = (overrides?: Partial<TransformResult>): TransformResult => ({
  original: { APP_NAME: 'app', SECRET_KEY: 'old', PORT: '3000' },
  transformed: { APP_NAME: 'APP', SECRET_KEY: 'new', PORT: '3000' },
  changes: [
    { key: 'APP_NAME', before: 'app', after: 'APP' },
    { key: 'SECRET_KEY', before: 'old', after: 'new' },
  ],
  ...overrides,
});

describe('formatTransformChange', () => {
  it('formats a plain key change', () => {
    const line = formatTransformChange({ key: 'APP_NAME', before: 'app', after: 'APP' });
    expect(line).toContain('APP_NAME');
    expect(line).toContain('app');
    expect(line).toContain('APP');
    expect(line).toContain('→');
  });

  it('masks sensitive key values', () => {
    const line = formatTransformChange({ key: 'SECRET_KEY', before: 'old', after: 'new' });
    expect(line).not.toContain('old');
    expect(line).not.toContain('new');
    expect(line).toContain('****');
  });

  it('masks password key values', () => {
    const line = formatTransformChange({ key: 'DB_PASSWORD', before: 'pass1', after: 'pass2' });
    expect(line).toContain('****');
    expect(line).not.toContain('pass1');
  });
});

describe('formatTransformResult', () => {
  it('returns no-changes message when empty', () => {
    const result = makeResult({ changes: [] });
    expect(formatTransformResult(result)).toContain('No changes');
  });

  it('lists all changes', () => {
    const output = formatTransformResult(makeResult());
    expect(output).toContain('Transform changes:');
    expect(output).toContain('APP_NAME');
    expect(output).toContain('SECRET_KEY');
  });

  it('includes arrow indicator for each change', () => {
    const output = formatTransformResult(makeResult());
    const arrows = (output.match(/→/g) || []).length;
    expect(arrows).toBe(2);
  });
});

describe('formatTransformSummary', () => {
  it('reports correct totals', () => {
    const output = formatTransformSummary(makeResult());
    expect(output).toContain('3');
    expect(output).toContain('2');
    expect(output).toContain('1');
  });

  it('shows zero changed when no changes', () => {
    const result = makeResult({ changes: [] });
    const output = formatTransformSummary(result);
    expect(output).toMatch(/Changed\s*:\s*0/);
  });
});
