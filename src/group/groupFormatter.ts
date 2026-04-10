import { GroupResult } from './envGroup';

const MASK = '****';

export function maskGroupValue(value: string, mask: boolean): string {
  return mask ? MASK : value;
}

export function formatGroupSection(
  name: string,
  entries: Record<string, string>,
  maskValues: boolean
): string {
  const lines: string[] = [`[${name}]`];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`  ${key}=${maskGroupValue(value, maskValues)}`);
  }
  return lines.join('\n');
}

export function formatGroupResult(
  result: GroupResult,
  maskValues: boolean = false
): string {
  const lines: string[] = [];

  for (const [name, entries] of Object.entries(result.groups)) {
    lines.push(formatGroupSection(name, entries, maskValues));
  }

  if (Object.keys(result.ungrouped).length > 0) {
    lines.push(formatGroupSection('(ungrouped)', result.ungrouped, maskValues));
  }

  return lines.join('\n\n');
}

export function formatGroupSummary(result: GroupResult): string {
  const groupNames = Object.keys(result.groups);
  const ungroupedCount = Object.keys(result.ungrouped).length;
  const lines: string[] = [
    `Groups found  : ${result.totalGroups}`,
    `Total keys    : ${result.totalKeys}`,
    `Ungrouped keys: ${ungroupedCount}`,
  ];
  if (groupNames.length > 0) {
    lines.push(`Group names   : ${groupNames.join(', ')}`);
  }
  return lines.join('\n');
}
