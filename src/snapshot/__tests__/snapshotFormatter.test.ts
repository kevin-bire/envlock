import {
  formatSnapshotHeader,
  formatSnapshotValues,
  maskSnapshotValue,
  formatSnapshotSummary,
  formatSnapshotFull,
} from '../snapshotFormatter';
import { EnvSnapshot } from '../envSnapshot';

const mockSnapshot: EnvSnapshot = {
  id: 'snap-001',
  timestamp: '2024-01-15T10:00:00.000Z',
  environment: 'production',
  checksum: 'abc123def456',
  values: {
    DATABASE_URL: 'postgres://user:secret@localhost/db',
    API_KEY: 'sk-supersecret',
    PORT: '3000',
    DEBUG: 'false',
  },
};

describe('maskSnapshotValue', () => {
  it('masks sensitive keys fully', () => {
    expect(maskSnapshotValue('API_KEY', 'sk-supersecret')).toBe('**********');
    expect(maskSnapshotValue('DATABASE_URL', 'postgres://...')).toBe('**********');
  });

  it('does not mask non-sensitive keys', () => {
    expect(maskSnapshotValue('PORT', '3000')).toBe('3000');
    expect(maskSnapshotValue('DEBUG', 'false')).toBe('false');
  });
});

describe('formatSnapshotHeader', () => {
  it('includes snapshot id, environment, and timestamp', () => {
    const header = formatSnapshotHeader(mockSnapshot);
    expect(header).toContain('snap-001');
    expect(header).toContain('production');
    expect(header).toContain('2024-01-15T10:00:00.000Z');
  });

  it('includes checksum', () => {
    const header = formatSnapshotHeader(mockSnapshot);
    expect(header).toContain('abc123def456');
  });
});

describe('formatSnapshotValues', () => {
  it('masks sensitive values when mask=true', () => {
    const output = formatSnapshotValues(mockSnapshot.values, true);
    expect(output).toContain('API_KEY');
    expect(output).not.toContain('sk-supersecret');
    expect(output).toContain('**********');
  });

  it('shows plain values when mask=false', () => {
    const output = formatSnapshotValues(mockSnapshot.values, false);
    expect(output).toContain('sk-supersecret');
    expect(output).toContain('3000');
  });
});

describe('formatSnapshotSummary', () => {
  it('returns summary with key count', () => {
    const summary = formatSnapshotSummary(mockSnapshot);
    expect(summary).toContain('4');
    expect(summary).toContain('production');
  });
});

describe('formatSnapshotFull', () => {
  it('includes header and values', () => {
    const full = formatSnapshotFull(mockSnapshot, true);
    expect(full).toContain('snap-001');
    expect(full).toContain('API_KEY');
    expect(full).toContain('PORT');
  });
});
