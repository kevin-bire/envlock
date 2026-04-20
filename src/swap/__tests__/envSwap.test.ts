import { swapValues, swapKeys, SwapOperation } from '../envSwap';
import { ParsedEnv } from '../../parser/envParser';

describe('swapValues', () => {
  const env: ParsedEnv = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    API_KEY: 'secret',
  };

  it('swaps values between two keys', () => {
    const ops: SwapOperation[] = [{ keyA: 'DB_HOST', keyB: 'DB_PORT' }];
    const result = swapValues(env, ops);
    expect(result.output['DB_HOST']).toBe('5432');
    expect(result.output['DB_PORT']).toBe('localhost');
    expect(result.swapped).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
    expect(result.totalSwaps).toBe(1);
  });

  it('skips when a key is missing', () => {
    const ops: SwapOperation[] = [{ keyA: 'DB_HOST', keyB: 'MISSING_KEY' }];
    const result = swapValues(env, ops);
    expect(result.output['DB_HOST']).toBe('localhost');
    expect(result.skipped).toHaveLength(1);
    expect(result.totalSwaps).toBe(0);
  });

  it('handles multiple operations', () => {
    const ops: SwapOperation[] = [
      { keyA: 'DB_HOST', keyB: 'DB_PORT' },
      { keyA: 'API_KEY', keyB: 'MISSING' },
    ];
    const result = swapValues(env, ops);
    expect(result.swapped).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });

  it('does not mutate original env', () => {
    const ops: SwapOperation[] = [{ keyA: 'DB_HOST', keyB: 'DB_PORT' }];
    swapValues(env, ops);
    expect(env['DB_HOST']).toBe('localhost');
  });
});

describe('swapKeys', () => {
  const env: ParsedEnv = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    API_KEY: 'secret',
  };

  it('swaps key names while preserving values', () => {
    const ops: SwapOperation[] = [{ keyA: 'DB_HOST', keyB: 'DB_PORT' }];
    const result = swapKeys(env, ops);
    expect(result.output['DB_PORT']).toBe('localhost');
    expect(result.output['DB_HOST']).toBe('5432');
    expect(result.output['API_KEY']).toBe('secret');
    expect(result.swapped).toHaveLength(1);
  });

  it('skips when a key is missing', () => {
    const ops: SwapOperation[] = [{ keyA: 'DB_HOST', keyB: 'NO_KEY' }];
    const result = swapKeys(env, ops);
    expect(result.output['DB_HOST']).toBe('localhost');
    expect(result.skipped).toHaveLength(1);
  });

  it('preserves unaffected keys', () => {
    const ops: SwapOperation[] = [{ keyA: 'DB_HOST', keyB: 'DB_PORT' }];
    const result = swapKeys(env, ops);
    expect(result.output['API_KEY']).toBe('secret');
  });
});
