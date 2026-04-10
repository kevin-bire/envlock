import { injectEnv, ejectEnv } from '../envInject';

describe('injectEnv', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore process.env after each test
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  it('injects all keys into process.env', () => {
    const result = injectEnv({ API_KEY: 'abc123', PORT: '3000' });
    expect(process.env.API_KEY).toBe('abc123');
    expect(process.env.PORT).toBe('3000');
    expect(result.injected).toContain('API_KEY');
    expect(result.injected).toContain('PORT');
    expect(result.skipped).toHaveLength(0);
    expect(result.total).toBe(2);
  });

  it('skips existing keys when override is false', () => {
    process.env.EXISTING_KEY = 'original';
    const result = injectEnv({ EXISTING_KEY: 'new_value' }, { override: false });
    expect(process.env.EXISTING_KEY).toBe('original');
    expect(result.skipped).toContain('EXISTING_KEY');
    expect(result.injected).toHaveLength(0);
  });

  it('overrides existing keys when override is true', () => {
    process.env.EXISTING_KEY = 'original';
    const result = injectEnv({ EXISTING_KEY: 'new_value' }, { override: true });
    expect(process.env.EXISTING_KEY).toBe('new_value');
    expect(result.injected).toContain('EXISTING_KEY');
    expect(result.skipped).toHaveLength(0);
  });

  it('applies prefix to injected keys', () => {
    const result = injectEnv({ DB_HOST: 'localhost' }, { prefix: 'APP_' });
    expect(process.env.APP_DB_HOST).toBe('localhost');
    expect(result.injected).toContain('APP_DB_HOST');
  });

  it('does not mutate process.env in dryRun mode', () => {
    const before = { ...process.env };
    const result = injectEnv({ DRY_KEY: 'dry_value' }, { dryRun: true });
    expect(process.env.DRY_KEY).toBeUndefined();
    expect(result.injected).toContain('DRY_KEY');
    expect(result.dryRun).toBe(true);
    expect(process.env).toEqual(before);
  });

  it('returns correct total count', () => {
    process.env.SKIP_ME = 'yes';
    const result = injectEnv({ SKIP_ME: 'no', NEW_KEY: 'value' });
    expect(result.total).toBe(2);
    expect(result.injected).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });
});

describe('ejectEnv', () => {
  it('removes specified keys from process.env', () => {
    process.env.TEMP_KEY = 'temp';
    const removed = ejectEnv(['TEMP_KEY']);
    expect(process.env.TEMP_KEY).toBeUndefined();
    expect(removed).toContain('TEMP_KEY');
  });

  it('ignores keys that do not exist in process.env', () => {
    const removed = ejectEnv(['NON_EXISTENT_KEY_XYZ']);
    expect(removed).toHaveLength(0);
  });

  it('removes multiple keys at once', () => {
    process.env.KEY_A = 'a';
    process.env.KEY_B = 'b';
    const removed = ejectEnv(['KEY_A', 'KEY_B']);
    expect(removed).toHaveLength(2);
    expect(process.env.KEY_A).toBeUndefined();
    expect(process.env.KEY_B).toBeUndefined();
  });
});
