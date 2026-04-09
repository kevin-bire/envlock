import { EnvDiff, DiffEntry } from './envDiff';
import { formatDiff } from './diffFormatter';
import { appendAuditLog } from '../audit/auditLog';

export interface ReportOptions {
  auditPath?: string;
  maskSecrets?: boolean;
  outputFormat?: 'text' | 'json';
}

export interface DiffReport {
  summary: {
    added: number;
    removed: number;
    changed: number;
    total: number;
  };
  formatted: string;
  timestamp: string;
}

export function buildSummary(diff: EnvDiff): DiffReport['summary'] {
  return {
    added: diff.added.length,
    removed: diff.removed.length,
    changed: diff.changed.length,
    total: diff.added.length + diff.removed.length + diff.changed.length,
  };
}

export function generateReport(
  diff: EnvDiff,
  sourceLabel: string,
  targetLabel: string,
  options: ReportOptions = {}
): DiffReport {
  const { maskSecrets = true, outputFormat = 'text' } = options;
  const summary = buildSummary(diff);
  const timestamp = new Date().toISOString();

  let formatted: string;

  if (outputFormat === 'json') {
    formatted = JSON.stringify({ sourceLabel, targetLabel, summary, diff, timestamp }, null, 2);
  } else {
    const lines: string[] = [
      `Diff Report: ${sourceLabel} → ${targetLabel}`,
      `Generated: ${timestamp}`,
      `─────────────────────────────────────`,
      formatDiff(diff, maskSecrets),
      `─────────────────────────────────────`,
      `Summary: +${summary.added} added, -${summary.removed} removed, ~${summary.changed} changed`,
    ];
    formatted = lines.join('\n');
  }

  return { summary, formatted, timestamp };
}

export async function reportAndAudit(
  diff: EnvDiff,
  sourceLabel: string,
  targetLabel: string,
  options: ReportOptions = {}
): Promise<DiffReport> {
  const report = generateReport(diff, sourceLabel, targetLabel, options);

  if (options.auditPath && report.summary.total > 0) {
    const action = `diff:${sourceLabel}→${targetLabel} (+${report.summary.added}/-${report.summary.removed}/~${report.summary.changed})`;
    await appendAuditLog(options.auditPath, {
      action,
      timestamp: report.timestamp,
      details: report.summary,
    });
  }

  return report;
}
