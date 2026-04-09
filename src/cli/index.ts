#!/usr/bin/env node

/**
 * envlock CLI entry point
 * Provides commands for validating, diffing, and syncing .env files
 */

import { Command } from 'commander';
import * as path from 'path';
import { parseEnvFile } from '../parser/envParser';
import { loadSchema, resolveSchemaPath } from '../schema/schemaLoader';
import { validateEnv } from '../schema/schemaValidator';
import { diffEnvs } from '../diff/envDiff';
import { formatDiff } from '../diff/diffFormatter';

const program = new Command();

program
  .name('envlock')
  .description('Validate, diff, and sync .env files across environments with schema enforcement')
  .version('0.1.0');

/**
 * validate command
 * Validates a .env file against a schema
 */
program
  .command('validate')
  .description('Validate a .env file against a schema')
  .argument('<envFile>', 'Path to the .env file to validate')
  .option('-s, --schema <schemaFile>', 'Path to the schema file (default: .envschema.json)')
  .action((envFile: string, options: { schema?: string }) => {
    try {
      const envPath = path.resolve(process.cwd(), envFile);
      const schemaPath = resolveSchemaPath(options.schema);

      const env = parseEnvFile(envPath);
      const schema = loadSchema(schemaPath);
      const result = validateEnv(env, schema);

      if (result.valid) {
        console.log(`✅ ${envFile} is valid.`);
        process.exit(0);
      } else {
        console.error(`❌ Validation failed for ${envFile}:`);
        result.errors.forEach((err) => console.error(`  - ${err}`));
        process.exit(1);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

/**
 * diff command
 * Shows the diff between two .env files
 */
program
  .command('diff')
  .description('Show differences between two .env files')
  .argument('<baseFile>', 'Path to the base .env file')
  .argument('<compareFile>', 'Path to the .env file to compare against')
  .option('-m, --mask-secrets', 'Mask secret values in output', false)
  .action((baseFile: string, compareFile: string, options: { maskSecrets: boolean }) => {
    try {
      const basePath = path.resolve(process.cwd(), baseFile);
      const comparePath = path.resolve(process.cwd(), compareFile);

      const baseEnv = parseEnvFile(basePath);
      const compareEnv = parseEnvFile(comparePath);

      const diff = diffEnvs(baseEnv, compareEnv);

      if (diff.length === 0) {
        console.log('✅ No differences found.');
        process.exit(0);
      }

      console.log(`Diff between ${baseFile} and ${compareFile}:\n`);
      console.log(formatDiff(diff, { maskSecrets: options.maskSecrets }));
      process.exit(0);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
