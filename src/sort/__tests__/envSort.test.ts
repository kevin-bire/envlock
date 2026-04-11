import { sortEnv } from '../envSort';
import { ParsedEnv } from '../../parser/envParser';

describe('sortEnv', () => {
  const env: ParsedEnv = {
    ZEBRA: 'z',
    APPLE: 'a',
    MANGO: 'm',
  };

  it('sorts keys in ascending order by default', () => {
    const result = sortEnv(env);
    expect(Object.keys(result.sorted)).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys in descending order', () => {
    const result = sortEnv(env, { order: 'desc' });
    expect(Object.keys(result.sorted)).toEqual(['ZEBRA', 'MANGO', 'APPLE']);
  });

  it('detects changed as true when keys are reordered', () => {
    const result = sortEnv(env);
    expect(result.changed).toBe(true);
  });

  it('detects changed as false when already sorted', () => {
    const sorted: ParsedEnv = { APPLE: 'a', MANGO: 'm', ZEBRA: 'z' };
    const result = sortEnv(sorted);
    expect(result.changed).toBe(false);
    expect(result.movedKeys).toHaveLength(0);
  });

  it('preserves values after sorting', () => {
    const result = sortEnv(env);
    expect(result.sorted['APPLE']).toBe('a');
    expect(result.sorted['MANGO']).toBe('m');
    expect(result.sorted['ZEBRA']).toBe('z');
  });

  it('groups by prefix when option is enabled', () => {
    const prefixedEnv: ParsedEnv = {
      DB_HOST: 'localhost',
      APP_NAME: 'envlock',
      DB_PORT: '5432',
      APP_ENV: 'production',
    };
    const result = sortEnv(prefixedEnv, { groupByPrefix: true });
    const keys = Object.keys(result.sorted);
    expect(keys.indexOf('APP_ENV')).toBeLessThan(keys.indexOf('DB_HOST'));
    expect(keys.indexOf('APP_NAME')).toBeLessThan(keys.indexOf('DB_PORT'));
  });

  it('handles empty env', () => {
    const result = sortEnv({});
    expect(result.sorted).toEqual({});
    expect(result.changed).toBe(false);
  });

  it('reports movedKeys correctly', () => {
    const result = sortEnv(env);
    expect(result.movedKeys).toContain('ZEBRA');
    expect(result.movedKeys).toContain('APPLE');
  });
});
