import { lowerKeys, lowerValues, lowerEnv } from '../envLowercase';

const sample: Record<string, string> = {
  APP_NAME: 'MyApp',
  DB_HOST: 'Localhost',
  PORT: '3000',
};

describe('lowerKeys', () => {
  it('lowercases all keys', () => {
    const { result, changes } = lowerKeys(sample);
    expect(result).toHaveProperty('app_name', 'MyApp');
    expect(result).toHaveProperty('db_host', 'Localhost');
    expect(changes).toHaveLength(3);
    expect(changes[0].field).toBe('key');
  });

  it('preserves values unchanged', () => {
    const { result } = lowerKeys(sample);
    expect(result['app_name']).toBe('MyApp');
  });

  it('records no changes when keys are already lowercase', () => {
    const { changes } = lowerKeys({ foo: 'bar' });
    expect(changes).toHaveLength(0);
  });
});

describe('lowerValues', () => {
  it('lowercases all values', () => {
    const { result, changes } = lowerValues(sample);
    expect(result['APP_NAME']).toBe('myapp');
    expect(result['DB_HOST']).toBe('localhost');
    expect(changes[0].field).toBe('value');
  });

  it('preserves keys unchanged', () => {
    const { result } = lowerValues(sample);
    expect(result).toHaveProperty('APP_NAME');
  });

  it('skips already lowercase values', () => {
    const { changes } = lowerValues({ KEY: 'already' });
    expect(changes).toHaveLength(0);
  });
});

describe('lowerEnv', () => {
  it('defaults to lowercasing keys', () => {
    const { result } = lowerEnv(sample);
    expect(result).toHaveProperty('app_name');
  });

  it('lowercases both keys and values when target is both', () => {
    const { result, changes } = lowerEnv(sample, 'both');
    expect(result).toHaveProperty('app_name', 'myapp');
    expect(changes.length).toBeGreaterThan(3);
  });

  it('returns original reference', () => {
    const { original } = lowerEnv(sample, 'values');
    expect(original).toBe(sample);
  });
});
