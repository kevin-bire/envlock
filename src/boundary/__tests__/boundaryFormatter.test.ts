import { formatViolation, formatBoundaryResult, formatBoundarySummary } from '../boundaryFormatter';
import { BoundaryResult, BoundaryViolation } from '../envBoundary';

const makeViolation = (overrides: Partial<BoundaryViolation> = {}): BoundaryViolation => ({
  key: 'API_KEY',
  actualValue: 'short',
  actualLength: 5,
  minLength: 10,
  reason: 'value too short',
  ...overrides,
});

const makeResult = (overrides: Partial<BoundaryResult> = {}): BoundaryResult => ({
  checked: 3,
  violations: [],
  passed: true,
  ...overrides,
});

describe('formatViolation', () => {
  it('includes key name', () => {
    const output = formatViolation(makeViolation());
    expect(output).toContain('API_KEY');
  });

  it('includes min length info when present', () => {
    const output = formatViolation(makeViolation({ minLength: 10, actualLength: 5 }));
    expect(output).toContain('min length: 10');
    expect(output).toContain('actual: 5');
  });

  it('includes max length info when present', () => {
    const output = formatViolation(makeViolation({ maxLength: 8, actualLength: 20, minLength: undefined }));
    expect(output).toContain('max length: 8');
    expect(output).toContain('actual: 20');
  });

  it('includes pattern info when present', () => {
    const output = formatViolation(makeViolation({ pattern: '^[A-Z]+$', minLength: undefined }));
    expect(output).toContain('pattern: ^[A-Z]+$');
    expect(output).toContain('no match');
  });

  it('includes allowed values when present', () => {
    const output = formatViolation(makeViolation({ allowedValues: ['dev', 'prod'], actualValue: 'staging', minLength: undefined }));
    expect(output).toContain('allowed: [dev, prod]');
    expect(output).toContain('"staging"');
  });

  it('includes reason when present', () => {
    const output = formatViolation(makeViolation({ reason: 'custom reason' }));
    expect(output).toContain('reason: custom reason');
  });
});

describe('formatBoundaryResult', () => {
  it('shows pass message when no violations', () => {
    const output = formatBoundaryResult(makeResult());
    expect(output).toContain('All keys passed boundary checks.');
  });

  it('shows violations count when there are violations', () => {
    const result = makeResult({ violations: [makeViolation()], passed: false });
    const output = formatBoundaryResult(result);
    expect(output).toContain('1 violation(s)');
    expect(output).toContain('API_KEY');
  });

  it('includes header', () => {
    const output = formatBoundaryResult(makeResult());
    expect(output).toContain('Boundary Check Results');
  });
});

describe('formatBoundarySummary', () => {
  it('shows PASS when no violations', () => {
    const output = formatBoundarySummary(makeResult({ checked: 5, violations: [] }));
    expect(output).toContain('✔ PASS');
    expect(output).toContain('checked: 5');
    expect(output).toContain('passed: 5');
    expect(output).toContain('failed: 0');
  });

  it('shows FAIL when there are violations', () => {
    const result = makeResult({ checked: 4, violations: [makeViolation()], passed: false });
    const output = formatBoundarySummary(result);
    expect(output).toContain('✖ FAIL');
    expect(output).toContain('failed: 1');
    expect(output).toContain('passed: 3');
  });
});
