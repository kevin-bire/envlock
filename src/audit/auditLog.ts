import * as fs from 'fs';
import * as path from 'path';

export type AuditAction = 'validate' | 'diff' | 'sync' | 'schema-load';

export interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  files: string[];
  result: 'success' | 'failure' | 'warning';
  details?: string;
}

export function createAuditEntry(
  action: AuditAction,
  files: string[],
  result: AuditEntry['result'],
  details?: string
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    action,
    files,
    result,
    details,
  };
}

export function formatAuditEntry(entry: AuditEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `ACTION=${entry.action}`,
    `RESULT=${entry.result}`,
    `FILES=${entry.files.join(', ')}`,
  ];
  if (entry.details) {
    parts.push(`DETAILS=${entry.details}`);
  }
  return parts.join(' | ');
}

export function appendAuditLog(logPath: string, entry: AuditEntry): void {
  const line = formatAuditEntry(entry) + '\n';
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(logPath, line, 'utf-8');
}

export function readAuditLog(logPath: string): AuditEntry[] {
  if (!fs.existsSync(logPath)) {
    return [];
  }
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  return lines.map((line) => {
    const get = (key: string): string => {
      const match = line.match(new RegExp(`${key}=([^|]+)(?:\\||$)`));
      return match ? match[1].trim() : '';
    };
    return {
      timestamp: line.match(/\[([^\]]+)\]/)?.[1] ?? '',
      action: get('ACTION') as AuditAction,
      files: get('FILES').split(',').map((f) => f.trim()),
      result: get('RESULT') as AuditEntry['result'],
      details: get('DETAILS') || undefined,
    };
  });
}
