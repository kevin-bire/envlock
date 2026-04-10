import { formatOperation, formatRenameResult, formatRenameSummary } from '../renameFormatter';
import { RenameResult } from '../envRename';

const mockResult: RenameResult = {
  renamed: [{ oldKey: 'OLD_KEY', newKey: 'NEW_KEY' }],
  skipped: [{ oldKey: 'SKIP_KEY', newKey: 'TAKEN_KEY' }],
  notFound: [{ oldKey: 'GHOST_KEY', newKey: 'WHATEVER' }],
  output: { NEW_KEY: 'value', TAKEN_KEY: 'other' },
};

describe('formatOperation', () => {
  it('includes arrow notation', () => {
    const line = formatOperation({ oldKey: 'A', newKey: 'B' }, 'renamed');
    expect(line).toContain('A → B');
  });

  it('includes checkmark for renamed', () => {
    const line = formatOperation({ oldKey: 'A', newKey: 'B' }, 'renamed');
    expect(line).toContain('✔');
  });

  it('includes warning for skipped', () => {
    const line = formatOperation({ oldKey: 'A', newKey: 'B' }, 'skipped');
    expect(line).toContain('⚠');
    expect(line).toContain('already exists');
  });

  it('includes cross for notFound', () => {
    const line = formatOperation({ oldKey: 'A', newKey: 'B' }, 'notFound');
    expect(line).toContain('✘');
    expect(line).toContain('not found');
  });
});

describe('formatRenameResult', () => {
  it('includes section headers', () => {
    const output = formatRenameResult(mockResult);
    expect(output).toContain('Renamed:');
    expect(output).toContain('Skipped:');
    expect(output).toContain('Not Found:');
  });

  it('includes all operation keys', () => {
    const output = formatRenameResult(mockResult);
    expect(output).toContain('OLD_KEY');
    expect(output).toContain('SKIP_KEY');
    expect(output).toContain('GHOST_KEY');
  });

  it('omits empty sections', () => {
    const emptyResult: RenameResult = {
      renamed: [],
      skipped: [],
      notFound: [],
      output: {},
    };
    const output = formatRenameResult(emptyResult);
    expect(output).not.toContain('Renamed:');
    expect(output).not.toContain('Skipped:');
  });
});

describe('formatRenameSummary', () => {
  it('shows counts for each category', () => {
    const output = formatRenameSummary(mockResult);
    expect(output).toContain('Renamed : 1');
    expect(output).toContain('Skipped : 1');
    expect(output).toContain('Not Found: 1');
  });
});
