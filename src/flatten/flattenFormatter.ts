import type { FlattenResult, ExpandResult } from "./envFlatten";

const ADDED = "\x1b[32m+\x1b[0m";
const INFO = "\x1b[36mi\x1b[0m";

export function formatFlattenResult(result: FlattenResult): string {
  const lines: string[] = [];

  lines.push(`${INFO} Flattened ${result.expandedKeys.length} key(s) from JSON object:\n`);

  for (const key of result.expandedKeys) {
    const value = result.flattened[key];
    const display = value.length > 40 ? value.slice(0, 37) + "..." : value;
    lines.push(`  ${ADDED} ${key}=${display}`);
  }

  return lines.join("\n");
}

export function formatFlattenSummary(result: FlattenResult): string {
  const total = Object.keys(result.flattened).length;
  const added = result.expandedKeys.length;
  return `Flatten complete: ${added} key(s) added, ${total} total in env.`;
}

export function formatExpandResult(result: ExpandResult): string {
  const lines: string[] = [];
  lines.push(`${INFO} Expanded ${result.keys.length} key(s) into nested object:\n`);

  const walk = (obj: Record<string, unknown>, indent: number): void => {
    for (const [k, v] of Object.entries(obj)) {
      const pad = " ".repeat(indent * 2);
      if (typeof v === "object" && v !== null) {
        lines.push(`${pad}${k}:`);
        walk(v as Record<string, unknown>, indent + 1);
      } else {
        lines.push(`${pad}${k}: ${String(v)}`);
      }
    }
  };

  walk(result.expanded as Record<string, unknown>, 1);
  return lines.join("\n");
}

export function formatExpandSummary(result: ExpandResult): string {
  return `Expand complete: ${result.keys.length} key(s) expanded into nested structure.`;
}
