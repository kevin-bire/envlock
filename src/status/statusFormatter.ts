import { EnvStatus } from './envStatus';

export function formatStatusEntry(key: string, status: string, value?: string): string {
  const icon = status === 'ok' ? '✔' : status === 'missing' ? '✘' : '~';
  const display = value !== undefined ? ` = ${value}` : '';
  return `  ${icon} ${key}${display} [${status}]`;
}

export function formatStatusResult(result: EnvStatus): string {
  const lines: string[] = [];

  lines.push(`File: ${result.file}`);
  lines.push(`Environment: ${result.environment}`);
  lines.push('');

  if (result.present.length > 0) {
    lines.push('Present:');
    for (const key of result.present) {
      lines.push(formatStatusEntry(key, 'ok'));
    }
  }

  if (result.missing.length > 0) {
    lines.push('');
    lines.push('Missing:');
    for (const key of result.missing) {
      lines.push(formatStatusEntry(key, 'missing'));
    }
  }

  if (result.extra.length > 0) {
    lines.push('');
    lines.push('Extra (not in schema):');
    for (const key of result.extra) {
      lines.push(formatStatusEntry(key, 'extra'));
    }
  }

  return lines.join('\n');
}

export function formatStatusSummary(result: EnvStatus): string {
  const total = result.present.length + result.missing.length + result.extra.length;
  const lines: string[] = [
    '─'.repeat(40),
    `Summary for: ${result.file}`,
    `  Total keys : ${total}`,
    `  Present    : ${result.present.length}`,
    `  Missing    : ${result.missing.length}`,
    `  Extra      : ${result.extra.length}`,
    `  Status     : ${result.missing.length === 0 ? '✔ OK' : '✘ Issues found'}`,
    '─'.repeat(40),
  ];
  return lines.join('\n');
}
