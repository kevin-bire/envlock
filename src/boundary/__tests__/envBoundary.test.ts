import { checkBoundaries, BoundaryRule } from '../envBoundary';
import { ParsedEnv } from '../../parser/envParser';

describe('checkBoundaries', () => {
  const env: ParsedEnv = {
    PORT: '8080',
    SECRET_KEY: 'abc123',
    APP_NAME: 'myapp',
    TIMEOUT: '30',
    EMPTY_VAL: '',
  };

  it('returns valid result when no rules are violated', () => {
    const rules: BoundaryRule[] = [
      { key: 'PORT', minLength: 1, maxLength: 10 },
    ];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.checkedKeys).toBe(1);
  });

  it('detects minLength violation', () => {
    const rules: BoundaryRule[] = [{ key: 'SECRET_KEY', minLength: 20 }];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('minLength');
    expect(result.violations[0].key).toBe('SECRET_KEY');
  });

  it('detects maxLength violation', () => {
    const rules: BoundaryRule[] = [{ key: 'APP_NAME', maxLength: 3 }];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('maxLength');
  });

  it('detects minValue violation', () => {
    const rules: BoundaryRule[] = [{ key: 'TIMEOUT', minValue: 60 }];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('minValue');
  });

  it('detects maxValue violation', () => {
    const rules: BoundaryRule[] = [{ key: 'PORT', maxValue: 1000 }];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('maxValue');
  });

  it('detects pattern violation', () => {
    const rules: BoundaryRule[] = [
      { key: 'APP_NAME', pattern: /^[A-Z]+$/ },
    ];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('pattern');
  });

  it('detects empty value violation when allowEmpty is false', () => {
    const rules: BoundaryRule[] = [{ key: 'EMPTY_VAL', allowEmpty: false }];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(false);
    expect(result.violations[0].rule).toBe('allowEmpty');
  });

  it('skips keys not present in env', () => {
    const rules: BoundaryRule[] = [{ key: 'MISSING_KEY', minLength: 5 }];
    const result = checkBoundaries(env, rules);
    expect(result.valid).toBe(true);
    expect(result.checkedKeys).toBe(0);
  });

  it('collects multiple violations across keys', () => {
    const rules: BoundaryRule[] = [
      { key: 'SECRET_KEY', minLength: 50 },
      { key: 'PORT', maxValue: 100 },
    ];
    const result = checkBoundaries(env, rules);
    expect(result.violations).toHaveLength(2);
    expect(result.valid).toBe(false);
  });
});
