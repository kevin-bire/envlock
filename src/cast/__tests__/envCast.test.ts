import { castValue, castEnv, CastField } from '../envCast';

describe('castValue', () => {
  it('returns string unchanged', () => {
    expect(castValue('hello', 'string')).toBe('hello');
  });

  it('casts valid number', () => {
    expect(castValue('42', 'number')).toBe(42);
    expect(castValue('3.14', 'number')).toBe(3.14);
  });

  it('throws on invalid number', () => {
    expect(() => castValue('abc', 'number')).toThrow('Cannot cast "abc" to number');
  });

  it('casts true/false booleans', () => {
    expect(castValue('true', 'boolean')).toBe(true);
    expect(castValue('false', 'boolean')).toBe(false);
    expect(castValue('1', 'boolean')).toBe(true);
    expect(castValue('0', 'boolean')).toBe(false);
  });

  it('throws on invalid boolean', () => {
    expect(() => castValue('yes', 'boolean')).toThrow('Cannot cast "yes" to boolean');
  });

  it('casts valid JSON', () => {
    expect(castValue('{"a":1}', 'json')).toEqual({ a: 1 });
    expect(castValue('[1,2,3]', 'json')).toEqual([1, 2, 3]);
  });

  it('throws on invalid JSON', () => {
    expect(() => castValue('{bad}', 'json')).toThrow('Cannot cast "{bad}" to JSON');
  });
});

describe('castEnv', () => {
  const env = {
    PORT: '3000',
    DEBUG: 'true',
    NAME: 'myapp',
    CONFIG: '{"timeout":30}',
    BAD_NUM: 'notanumber',
  };

  const fields: CastField[] = [
    { key: 'PORT', type: 'number' },
    { key: 'DEBUG', type: 'boolean' },
    { key: 'NAME', type: 'string' },
    { key: 'CONFIG', type: 'json' },
    { key: 'BAD_NUM', type: 'number' },
  ];

  it('casts valid fields correctly', () => {
    const { casted } = castEnv(env, fields);
    expect(casted['PORT']).toBe(3000);
    expect(casted['DEBUG']).toBe(true);
    expect(casted['NAME']).toBe('myapp');
    expect(casted['CONFIG']).toEqual({ timeout: 30 });
  });

  it('records errors for invalid casts', () => {
    const { errors } = castEnv(env, fields);
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe('BAD_NUM');
    expect(errors[0].expectedType).toBe('number');
  });

  it('skips keys not present in env', () => {
    const { casted, errors } = castEnv(env, [{ key: 'MISSING', type: 'number' }]);
    expect(errors).toHaveLength(0);
    expect(casted['MISSING']).toBeUndefined();
  });
});
