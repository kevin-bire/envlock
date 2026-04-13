import { transformEnv, applyRule, TransformRule } from '../envTransform';

const sampleEnv = {
  APP_NAME: '  my-app  ',
  DB_HOST: 'localhost',
  SECRET_KEY: 'abc123',
  PORT: '3000',
};

describe('applyRule', () => {
  it('applies a rule to all keys when no key filter given', () => {
    const rule: TransformRule = { fn: (_k, v) => v.trim() };
    const { env, changes } = applyRule({ APP_NAME: '  hello  ', PORT: ' 80 ' }, rule);
    expect(env.APP_NAME).toBe('hello');
    expect(env.PORT).toBe('80');
    expect(changes).toHaveLength(2);
  });

  it('applies a rule only to matching string key', () => {
    const rule: TransformRule = { key: 'APP_NAME', fn: (_k, v) => v.trim() };
    const { env, changes } = applyRule(sampleEnv, rule);
    expect(env.APP_NAME).toBe('my-app');
    expect(env.DB_HOST).toBe('localhost');
    expect(changes).toHaveLength(1);
    expect(changes[0].key).toBe('APP_NAME');
  });

  it('applies a rule to keys matching a regex', () => {
    const rule: TransformRule = { key: /^DB_/, fn: (_k, v) => v.toUpperCase() };
    const { env, changes } = applyRule(sampleEnv, rule);
    expect(env.DB_HOST).toBe('LOCALHOST');
    expect(env.APP_NAME).toBe('  my-app  ');
    expect(changes).toHaveLength(1);
  });

  it('records no changes when value is unchanged', () => {
    const rule: TransformRule = { fn: (_k, v) => v };
    const { changes } = applyRule(sampleEnv, rule);
    expect(changes).toHaveLength(0);
  });
});

describe('transformEnv', () => {
  it('applies multiple rules in order', () => {
    const rules: TransformRule[] = [
      { fn: (_k, v) => v.trim() },
      { fn: (_k, v) => v.toLowerCase() },
    ];
    const result = transformEnv({ KEY: '  HELLO  ' }, rules);
    expect(result.transformed.KEY).toBe('hello');
    expect(result.changes).toHaveLength(2);
  });

  it('returns original env unchanged when no rules', () => {
    const result = transformEnv(sampleEnv, []);
    expect(result.transformed).toEqual(sampleEnv);
    expect(result.changes).toHaveLength(0);
  });

  it('tracks all changes across rules', () => {
    const rules: TransformRule[] = [
      { key: 'PORT', fn: (_k, v) => String(Number(v) + 1) },
      { key: 'PORT', fn: (_k, v) => String(Number(v) * 2) },
    ];
    const result = transformEnv({ PORT: '3000' }, rules);
    expect(result.transformed.PORT).toBe('6002');
    expect(result.changes).toHaveLength(2);
  });

  it('preserves original env reference', () => {
    const env = { KEY: 'value' };
    const result = transformEnv(env, [{ fn: (_k, v) => v.toUpperCase() }]);
    expect(result.original.KEY).toBe('value');
    expect(result.transformed.KEY).toBe('VALUE');
  });
});
