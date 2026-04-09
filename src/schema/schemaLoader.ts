import * as fs from 'fs';
import * as path from 'path';
import { EnvSchema } from './schemaValidator';

export class SchemaLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaLoadError';
  }
}

export function loadSchema(schemaPath: string): EnvSchema {
  const resolved = path.resolve(schemaPath);

  if (!fs.existsSync(resolved)) {
    throw new SchemaLoadError(`Schema file not found: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (ext !== '.json') {
    throw new SchemaLoadError(`Unsupported schema format: ${ext}. Only .json is supported.`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolved, 'utf-8');
  } catch (err) {
    throw new SchemaLoadError(`Failed to read schema file: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SchemaLoadError(`Schema file contains invalid JSON: ${resolved}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new SchemaLoadError('Schema must be a JSON object.');
  }

  return parsed as EnvSchema;
}

export function resolveSchemaPath(cwd: string = process.cwd()): string {
  const candidates = ['.envschema.json', 'envschema.json', '.env.schema.json'];
  for (const candidate of candidates) {
    const full = path.join(cwd, candidate);
    if (fs.existsSync(full)) return full;
  }
  throw new SchemaLoadError(
    'No schema file found. Create a .envschema.json in your project root.'
  );
}
