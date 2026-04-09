import { generateReport, buildSummary, reportAndAudit } from '../diffReporter';
import { EnvDiff } from '../envDiff';
import * as auditLog from '../../audit/auditLog';

const sampleDiff: EnvDiff = {
  added: [{ key: 'NEW_KEY', targetValue: 'new_val' }],
  removed: [{ key: 'OLD_KEY', sourceValue: 'old_val' }],
  changed: [{ key: 'CHANGED_KEY', sourceValue: 'v1', targetValue: 'v2' }],
  unchanged: [{ key: 'SAME_KEY', sourceValue: 'same', targetValue: 'same' }],
};

describe('buildSummary', () => {
  it('counts entries correctly', () => {
    const summary = buildSummary(sampleDiff);
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.changed).toBe(1);
    expect(summary.total).toBe(3);
  });

  it('returns zeros for empty diff', () => {
    const empty: EnvDiff = { added: [], removed: [], changed: [], unchanged: [] };
    const summary = buildSummary(empty);
    expect(summary.total).toBe(0);
  });
});

describe('generateReport', () => {
  it('generates a text report with labels', () => {
    const report = generateReport(sampleDiff, '.env.local', '.env.prod');
    expect(report.formatted).toContain('.env.local');
    expect(report.formatted).toContain('.env.prod');
    expect(report.formatted).toContain('Summary:');
    expect(report.summary.total).toBe(3);
  });

  it('generates a JSON report when outputFormat is json', () => {
    const report = generateReport(sampleDiff, 'src', 'dst', { outputFormat: 'json' });
    const parsed = JSON.parse(report.formatted);
    expect(parsed.sourceLabel).toBe('src');
    expect(parsed.summary.total).toBe(3);
  });

  it('includes a valid ISO timestamp', () => {
    const report = generateReport(sampleDiff, 'a', 'b');
    expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
  });
});

describe('reportAndAudit', () => {
  it('calls appendAuditLog when auditPath is provided and diff is non-empty', async () => {
    const spy = jest.spyOn(auditLog, 'appendAuditLog').mockResolvedValue(undefined);
    const report = await reportAndAudit(sampleDiff, 'src', 'dst', { auditPath: '/tmp/audit.log' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(report.summary.total).toBe(3);
    spy.mockRestore();
  });

  it('does not call appendAuditLog when diff is empty', async () => {
    const spy = jest.spyOn(auditLog, 'appendAuditLog').mockResolvedValue(undefined);
    const empty: EnvDiff = { added: [], removed: [], changed: [], unchanged: [] };
    await reportAndAudit(empty, 'src', 'dst', { auditPath: '/tmp/audit.log' });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not call appendAuditLog when auditPath is not provided', async () => {
    const spy = jest.spyOn(auditLog, 'appendAuditLog').mockResolvedValue(undefined);
    await reportAndAudit(sampleDiff, 'src', 'dst');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
