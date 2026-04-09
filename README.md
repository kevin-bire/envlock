# envlock

A CLI tool to validate, diff, and sync .env files across environments with schema enforcement.

## Installation

```bash
npm install -g envlock
```

Or use with npx:

```bash
npx envlock [command]
```

## Usage

### Validate environment files against a schema

```bash
envlock validate --schema .env.schema --env .env.production
```

### Compare environment files

```bash
envlock diff .env.local .env.production
```

### Sync missing variables

```bash
envlock sync --from .env.example --to .env.local
```

### Initialize a schema from existing .env

```bash
envlock init --env .env.example --output .env.schema
```

## Schema Format

Define your environment variable schema in `.env.schema`:

```json
{
  "DATABASE_URL": { "type": "string", "required": true },
  "PORT": { "type": "number", "required": false, "default": 3000 },
  "NODE_ENV": { "type": "enum", "values": ["development", "production", "test"] }
}
```

## Features

- ✅ Schema validation with type checking
- 🔍 Diff environments to spot missing or extra variables
- 🔄 Sync variables across environment files
- 📋 Generate schemas from existing .env files
- 🚀 Zero dependencies, fast execution

## License

MIT