import { TaggedEntry, TagIndex, TagAnalysis } from './envTag';

export function formatTagEntry(entry: TaggedEntry, mask = false): string {
  const value = mask ? '****' : entry.value;
  const tags = entry.tags.length > 0 ? ` [${entry.tags.join(', ')}]` : ' [untagged]';
  return `  ${entry.key}=${value}${tags}`;
}

export function formatTagIndex(index: TagIndex): string {
  const lines: string[] = ['Tag Index:'];
  for (const [tag, keys] of Object.entries(index)) {
    lines.push(`  ${tag}: ${keys.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatTagResult(
  entries: TaggedEntry[],
  mask = false
): string {
  if (entries.length === 0) return 'No tagged entries found.';
  const lines = entries.map((e) => formatTagEntry(e, mask));
  return lines.join('\n');
}

export function formatTagSummary(analysis: TagAnalysis): string {
  const lines: string[] = [
    `Tag Summary:`,
    `  Total keys:   ${analysis.totalKeys}`,
    `  Tagged keys:  ${analysis.taggedKeys}`,
    `  Unique tags:  ${analysis.uniqueTags}`,
  ];

  if (analysis.tagCounts && Object.keys(analysis.tagCounts).length > 0) {
    lines.push('  Tag counts:');
    for (const [tag, count] of Object.entries(analysis.tagCounts)) {
      lines.push(`    ${tag}: ${count}`);
    }
  }

  return lines.join('\n');
}

export function formatFilteredByTag(
  tag: string,
  entries: TaggedEntry[],
  mask = false
): string {
  if (entries.length === 0) return `No keys found with tag "${tag}".`;
  const header = `Keys tagged "${tag}" (${entries.length}):`;
  const body = entries.map((e) => formatTagEntry(e, mask)).join('\n');
  return `${header}\n${body}`;
}
