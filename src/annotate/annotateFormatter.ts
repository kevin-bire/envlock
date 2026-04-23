import { AnnotateResult, Annotation } from './envAnnotate';

export function formatAnnotationEntry(annotation: Annotation): string {
  return `  ${annotation.key.padEnd(24)} # ${annotation.comment}`;
}

export function formatAnnotateResult(result: AnnotateResult): string {
  const lines: string[] = [];

  if (result.annotations.length > 0) {
    lines.push('Annotated keys:');
    for (const annotation of result.annotations) {
      lines.push(formatAnnotationEntry(annotation));
    }
  } else {
    lines.push('No keys were annotated.');
  }

  if (result.skipped.length > 0) {
    lines.push('');
    lines.push('Skipped (key not found):');
    for (const key of result.skipped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

export function formatAnnotateSummary(result: AnnotateResult): string {
  const parts: string[] = [
    `Annotated: ${result.annotations.length}`,
    `Skipped: ${result.skipped.length}`,
  ];
  return parts.join('  |  ');
}
