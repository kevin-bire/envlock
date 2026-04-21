import { EnvMap } from '../parser/envParser';

export interface SquashResult {
  squashed: EnvMap;
  overrides: Record<string, { from: string; to: string; source: number }[]>;
  totalKeys: number;
  overriddenCount: number;
}

/**
 * Squash multiple env maps into one, with later entries taking precedence.
 * Tracks which keys were overridden and from which source layer.
 */
export function squashEnvs(layers: EnvMap[]): SquashResult {
  const squashed: EnvMap = {};
  const overrides: Record<string, { from: string; to: string; source: number }[]> = {};

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    for (const [key, value] of Object.entries(layer)) {
      if (key in squashed && squashed[key] !== value) {
        if (!overrides[key]) overrides[key] = [];
        overrides[key].push({ from: squashed[key], to: value, source: i });
      }
      squashed[key] = value;
    }
  }

  const overriddenCount = Object.keys(overrides).length;

  return {
    squashed,
    overrides,
    totalKeys: Object.keys(squashed).length,
    overriddenCount,
  };
}

/**
 * Return only the keys that were overridden across layers.
 */
export function getOverriddenKeys(result: SquashResult): string[] {
  return Object.keys(result.overrides);
}
