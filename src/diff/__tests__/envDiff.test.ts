import { diffEnvs } from '../envDiff';

describe('diffEnvs', () => {
  it('detects added keys', () => {
    const base = { A: '1' };
    const target = { A: '1', B: '2' };
    const result = diffEnvs(base, target);
    expect(result.added).toBe(1);
    expect(result.entries.find(e => e.key === 'B')?.status).toBe('added');
  });

  it('detects removed keys', () => {
    const base = { A: '1', B: '2' };
    const target = { A: '1' };
    const result = diffEnvs(base, target);
    expect(result.removed).toBe(1);
    expect(result.entries.find(e => e.key === 'B')?.status).toBe('removed');
  });

  it('detects changed keys', () => {
    const base = { A: 'old' };
    const target = { A: 'new' };
    const result = diffEnvs(base, target);
    expect(result.changed).toBe(1);
    const entry = result.entries.find(e => e.key === 'A');
    expect(entry?.oldValue).toBe('old');
    expect(entry?.newValue).toBe('new');
  });

  it('detects unchanged keys', () => {
    const base = { A: '1' };
    const target = { A: '1' };
    const result = diffEnvs(base, target);
    expect(result.unchanged).toBe(1);
    expect(result.entries[0].status).toBe('unchanged');
  });

  it('handles empty envs', () => {
    const result = diffEnvs({}, {});
    expect(result.entries).toHaveLength(0);
    expect(result.added).toBe(0);
  });

  it('returns sorted entries', () => {
    const base = { Z: '1', A: '2' };
    const target = { Z: '1', A: '2' };
    const result = diffEnvs(base, target);
    expect(result.entries[0].key).toBe('A');
    expect(result.entries[1].key).toBe('Z');
  });
});
