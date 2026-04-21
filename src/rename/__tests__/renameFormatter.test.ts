import {
  formatOperation,
  formatRenameResult,
  formatRenameSummary,
  formatRenameReport,
  RenameOperation,
  RenameResult,
} from '../renameFormatter';

const makeResult = (overrides: Partial<RenameResult> = {}): RenameResult => ({
  operations: [],
  renamed: {},
  skipped: [],
  ...overrides,
});

describe('formatOperation', () => {
  it('formats a successful rename', () => {
    const op: RenameOperation = { from: 'OLD_KEY', to: 'NEW_KEY' };
    expect(formatOperation(op)).toBe('  ✔ OLD_KEY → NEW_KEY');
  });

  it('formats a skipped rename with reason', () => {
    const op: RenameOperation = { from: 'OLD_KEY', to: 'NEW_KEY', skipped: true, reason: 'target exists' };
    expect(formatOperation(op)).toBe('  ⚠ OLD_KEY → NEW_KEY (skipped: target exists)');
  });

  it('formats a skipped rename without reason', () => {
    const op: RenameOperation = { from: 'OLD_KEY', to: 'NEW_KEY', skipped: true };
    expect(formatOperation(op)).toContain('unknown');
  });
});

describe('formatRenameResult', () => {
  it('returns message when no operations', () => {
    const result = makeResult();
    expect(formatRenameResult(result)).toBe('No rename operations to perform.');
  });

  it('formats multiple operations', () => {
    const result = makeResult({
      operations: [
        { from: 'A', to: 'B' },
        { from: 'C', to: 'D', skipped: true, reason: 'conflict' },
      ],
    });
    const output = formatRenameResult(result);
    expect(output).toContain('✔ A → B');
    expect(output).toContain('⚠ C → D (skipped: conflict)');
  });
});

describe('formatRenameSummary', () => {
  it('shows correct counts', () => {
    const result = makeResult({
      operations: [
        { from: 'A', to: 'B' },
        { from: 'C', to: 'D', skipped: true },
      ],
      skipped: ['C'],
    });
    const summary = formatRenameSummary(result);
    expect(summary).toContain('Total operations : 2');
    expect(summary).toContain('Renamed          : 1');
    expect(summary).toContain('Skipped          : 1');
  });

  it('handles all successful', () => {
    const result = makeResult({
      operations: [{ from: 'X', to: 'Y' }],
      skipped: [],
    });
    const summary = formatRenameSummary(result);
    expect(summary).toContain('Renamed          : 1');
    expect(summary).toContain('Skipped          : 0');
  });
});

describe('formatRenameReport', () => {
  it('includes both operations and summary', () => {
    const result = makeResult({
      operations: [{ from: 'FOO', to: 'BAR' }],
      skipped: [],
    });
    const report = formatRenameReport(result);
    expect(report).toContain('Operations:');
    expect(report).toContain('✔ FOO → BAR');
    expect(report).toContain('Rename Summary:');
  });

  it('skips operations section when empty', () => {
    const result = makeResult();
    const report = formatRenameReport(result);
    expect(report).not.toContain('Operations:');
    expect(report).toContain('Rename Summary:');
  });
});
