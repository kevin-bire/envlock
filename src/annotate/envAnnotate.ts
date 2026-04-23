import { EnvMap } from '../parser/envParser';

export interface Annotation {
  key: string;
  comment: string;
}

export interface AnnotateResult {
  annotated: Record<string, string>;
  annotations: Annotation[];
  skipped: string[];
}

/**
 * Apply annotations (inline comments) to env keys.
 * Only keys present in the env map are annotated.
 */
export function annotateKeys(
  env: EnvMap,
  annotations: Record<string, string>
): AnnotateResult {
  const annotated: Record<string, string> = {};
  const applied: Annotation[] = [];
  const skipped: string[] = [];

  for (const [key, comment] of Object.entries(annotations)) {
    if (key in env) {
      annotated[key] = comment;
      applied.push({ key, comment });
    } else {
      skipped.push(key);
    }
  }

  return { annotated, annotations: applied, skipped };
}

/**
 * Serialize env map with inline annotations to .env format.
 */
export function serializeAnnotated(
  env: EnvMap,
  annotated: Record<string, string>
): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (annotated[key]) {
      lines.push(`# ${annotated[key]}`);
    }
    lines.push(`${key}=${value}`);
  }

  return lines.join('\n') + '\n';
}

/**
 * Strip all annotations from an annotated env record.
 */
export function stripAnnotations(
  annotated: Record<string, string>
): string[] {
  return Object.keys(annotated);
}
