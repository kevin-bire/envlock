import { InterpolateResult } from './envInterpolate';

export function formatUnresolved(unresolved: string[]): string {
  if (unresolved.length === 0) return '';
  const lines = unresolved.map((key) => `  ⚠  Unresolved reference: $\{${key}\}`);
  return `Unresolved Variables:\n${lines.join('\n')}`;
}

export function formatCycles(cycles: string[]): string {
  if (cycles.length === 0) return '';
  const lines = cycles.map((key) => `  ✖  Cyclic reference detected: ${key}`);
  return `Cyclic References:\n${lines.join('\n')}`;
}

export function formatInterpolateResult(result: InterpolateResult): string {
  const sections: string[] = [];

  const total = Object.keys(result.interpolated).length;
  const issues = result.unresolved.length + result.cycles.length;
  const status = issues === 0 ? '✔ All variables resolved' : `✖ ${issues} issue(s) found`;

  sections.push(`Interpolation Summary`);
  sections.push(`  Total keys : ${total}`);
  sections.push(`  Status     : ${status}`);

  const unresolvedBlock = formatUnresolved(result.unresolved);
  if (unresolvedBlock) sections.push(unresolvedBlock);

  const cyclesBlock = formatCycles(result.cycles);
  if (cyclesBlock) sections.push(cyclesBlock);

  return sections.join('\n');
}

export function formatInterpolateSummary(result: InterpolateResult): string {
  const total = Object.keys(result.interpolated).length;
  const unresolvedCount = result.unresolved.length;
  const cycleCount = result.cycles.length;

  if (unresolvedCount === 0 && cycleCount === 0) {
    return `✔ Interpolated ${total} variable(s) successfully.`;
  }

  const parts: string[] = [`✖ Interpolated ${total} variable(s) with issues:`];
  if (unresolvedCount > 0) parts.push(`  ${unresolvedCount} unresolved reference(s)`);
  if (cycleCount > 0) parts.push(`  ${cycleCount} cyclic reference(s)`);
  return parts.join('\n');
}
