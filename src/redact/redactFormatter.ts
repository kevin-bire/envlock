export interface RedactResult {
  original: Record<string, string>;
  redacted: Record<string, string>;
  redactedKeys: string[];
}

export function formatRedactedEntry(
  key: string,
  value: string,
  wasRedacted: boolean
): string {
  if (wasRedacted) {
    return `  ${key}: [REDACTED]`;
  }
  return `  ${key}: ${value}`;
}

export function formatRedactResult(result: RedactResult): string {
  const lines: string[] = ['Redacted Environment:'];

  for (const [key, value] of Object.entries(result.redacted)) {
    const wasRedacted = result.redactedKeys.includes(key);
    lines.push(formatRedactedEntry(key, value, wasRedacted));
  }

  return lines.join('\n');
}

export function formatRedactSummary(result: RedactResult): string {
  const total = Object.keys(result.original).length;
  const count = result.redactedKeys.length;

  const lines: string[] = [
    `Redact Summary:`,
    `  Total keys : ${total}`,
    `  Redacted   : ${count}`,
    `  Kept plain : ${total - count}`,
  ];

  if (count > 0) {
    lines.push(`  Keys redacted:`);
    for (const key of result.redactedKeys) {
      lines.push(`    - ${key}`);
    }
  }

  return lines.join('\n');
}
