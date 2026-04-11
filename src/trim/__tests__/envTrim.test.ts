import { trimValue, trimEnv } from '../envTrim';

describe('trimValue', () => {
  it('returns null type when value needs no trimming', () => {
    const result = trimValue('hello');
    expect(result.value).toBe('hello');
    expect(result.type).toBeNull();
  });

  it('detects trailing whitespace', () => {
    const result = trimValue('hello   ');
    expect(result.value).toBe('hello');
    expect(result.type).toBe('trailing');
  });

  it('detects leading whitespace', () => {
    const result = trimValue('   hello');
    expect(result.value).toBe('hello');
    expect(result.type).toBe('leading');
  });

  it('detects surrounding whitespace', () => {
    const result = trimValue('  hello  ');
    expect(result.value).toBe('hello');
    expect(result.type).toBe('both');
  });

  it('strips double quotes and trims', () => {
    const result = trimValue('" hello "');
    expect(result.value).toBe('hello');
    expect(result.type).toBe('quotes');
  });

  it('strips single quotes and trims', () => {
    const result = trimValue("' world '");
    expect(result.value).toBe('world');
    expect(result.type).toBe('quotes');
  });

  it('handles quoted value with no whitespace inside', () => {
    const result = trimValue('"hello"');
    expect(result.value).toBe('hello');
    expect(result.type).toBe('quotes');
  });
});

describe('trimEnv', () => {
  it('trims all values by default', () => {
    const env = { KEY1: '  value1  ', KEY2: 'clean', KEY3: '"quoted"' };
    const result = trimEnv(env);
    expect(result.trimmed).toEqual({ KEY1: 'value1', KEY2: 'clean', KEY3: 'quoted' });
    expect(result.totalTrimmed).toBe(2);
  });

  it('only trims specified keys', () => {
    const env = { KEY1: '  value1  ', KEY2: '  value2  ' };
    const result = trimEnv(env, ['KEY1']);
    expect(result.trimmed.KEY1).toBe('value1');
    expect(result.trimmed.KEY2).toBe('  value2  ');
    expect(result.totalTrimmed).toBe(1);
  });

  it('returns empty changes when nothing to trim', () => {
    const env = { A: 'clean', B: 'also_clean' };
    const result = trimEnv(env);
    expect(result.changes).toHaveLength(0);
    expect(result.totalTrimmed).toBe(0);
  });

  it('records correct before/after in changes', () => {
    const env = { SECRET: '  mysecret  ' };
    const result = trimEnv(env);
    expect(result.changes[0]).toMatchObject({
      key: 'SECRET',
      before: '  mysecret  ',
      after: 'mysecret',
      type: 'both',
    });
  });
});
