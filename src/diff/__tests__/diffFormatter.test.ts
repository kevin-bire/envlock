import { formatDiff } from '../diffFormatter';
import { diffEnvs } from '../envDiff';

describe('formatDiff', () => {
  const base = { APP: 'myapp', DB: 'localhost', SECRET: 'topsecret' };
  const target = { APP: 'myapp', DB: 'prod.db', NEW_KEY: 'newval' };

  it('returns no-differences message for identical envs', () => {
    const result = diffEnvs(base, base);
    const output = formatDiff(result);
    expect(output).toContain('No differences found');
  });

  it('includes added keys with + prefix', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result);
    expect(output).toContain('+ NEW_KEY=newval');
  });

  it('includes removed keys with - prefix', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result);
    expect(output).toContain('- SECRET=topsecret');
  });

  it('includes changed keys with ~ prefix', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result);
    expect(output).toContain('~ DB');
    expect(output).toContain('localhost');
    expect(output).toContain('prod.db');
  });

  it('masks values when maskValues is true', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result, { maskValues: true });
    expect(output).not.toContain('newval');
    expect(output).not.toContain('topsecret');
    expect(output).toContain('*');
  });

  it('shows unchanged keys when showUnchanged is true', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result, { showUnchanged: true });
    expect(output).toContain('APP=myapp');
  });

  it('hides unchanged keys by default', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result);
    expect(output).not.toContain('APP=myapp');
  });

  it('includes a summary line', () => {
    const result = diffEnvs(base, target);
    const output = formatDiff(result);
    expect(output).toContain('Summary:');
    expect(output).toContain('+1');
    expect(output).toContain('-1');
    expect(output).toContain('~1');
  });
});
