import { inheritEnv, getMissingInherited } from '../envInherit';
import { ParsedEnv } from '../../parser/envParser';

describe('inheritEnv', () => {
  const base: ParsedEnv = {
    APP_NAME: 'myapp',
    DB_HOST: 'localhost',
    LOG_LEVEL: 'info',
  };

  const override: ParsedEnv = {
    DB_HOST: 'prod.db.example.com',
    LOG_LEVEL: 'error',
    NEW_KEY: 'new_value',
  };

  it('inherits keys missing from override', () => {
    const result = inheritEnv(base, override);
    expect(result.inherited).toContain('APP_NAME');
    expect(result.merged['APP_NAME']).toBe('myapp');
  });

  it('marks overridden keys correctly', () => {
    const result = inheritEnv(base, override);
    expect(result.overridden).toContain('DB_HOST');
    expect(result.overridden).toContain('LOG_LEVEL');
  });

  it('marks added keys correctly', () => {
    const result = inheritEnv(base, override);
    expect(result.added).toContain('NEW_KEY');
    expect(result.merged['NEW_KEY']).toBe('new_value');
  });

  it('override values take precedence in merged result', () => {
    const result = inheritEnv(base, override);
    expect(result.merged['DB_HOST']).toBe('prod.db.example.com');
    expect(result.merged['LOG_LEVEL']).toBe('error');
  });

  it('sets base and override names', () => {
    const result = inheritEnv(base, override, '.env', '.env.prod');
    expect(result.base).toBe('.env');
    expect(result.override).toBe('.env.prod');
  });

  it('handles empty base', () => {
    const result = inheritEnv({}, override);
    expect(result.inherited).toHaveLength(0);
    expect(result.added).toEqual(Object.keys(override));
  });

  it('handles empty override', () => {
    const result = inheritEnv(base, {});
    expect(result.inherited).toEqual(Object.keys(base));
    expect(result.added).toHaveLength(0);
    expect(result.overridden).toHaveLength(0);
  });

  it('does not mark key as overridden when value is same', () => {
    const result = inheritEnv(
      { KEY: 'same' },
      { KEY: 'same' }
    );
    expect(result.overridden).toHaveLength(0);
    expect(result.inherited).toHaveLength(0);
  });
});

describe('getMissingInherited', () => {
  it('returns keys in base not present in override', () => {
    const missing = getMissingInherited(
      { A: '1', B: '2', C: '3' },
      { B: 'x' }
    );
    expect(missing).toContain('A');
    expect(missing).toContain('C');
    expect(missing).not.toContain('B');
  });

  it('returns empty when override has all base keys', () => {
    const missing = getMissingInherited({ A: '1' }, { A: '2' });
    expect(missing).toHaveLength(0);
  });
});
