/**
 * Count module for envlock.
 * Provides utilities for counting and summarizing environment variables.
 */
export { countEnv, countByPrefix } from './envCount';
export { formatCountResult, formatCountSummary, formatPrefixRow } from './countFormatter';
export type { CountResult } from './countFormatter';
