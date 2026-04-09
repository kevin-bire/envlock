import * as fs from 'fs';
import * as path from 'path';
import { loadSchema, resolveSchemaPath, SchemaLoadError } from '../schemaLoader';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('loadSchema', () => {
  beforeEach(() => jest.resetAllMocks());

  it('loads and parses a valid schema file', () => {
    const schema = { PORT: { type: 'number', required: true } };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(schema) as unknown as Buffer);

    const result = loadSchema('/project/.envschema.json');
    expect(result).toEqual(schema);
  });

  it('throws SchemaLoadError if file does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(() => loadSchema('/missing.json')).toThrow(SchemaLoadError);
  });

  it('throws SchemaLoadError for unsupported extension', () => {
    mockedFs.existsSync.mockReturnValue(true);
    expect(() => loadSchema('/schema.yaml')).toThrow(SchemaLoadError);
  });

  it('throws SchemaLoadError for invalid JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not json' as unknown as Buffer);
    expect(() => loadSchema('/schema.json')).toThrow(SchemaLoadError);
  });

  it('throws SchemaLoadError if JSON is not an object', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('[1,2,3]' as unknown as Buffer);
    expect(() => loadSchema('/schema.json')).toThrow(SchemaLoadError);
  });
});

describe('resolveSchemaPath', () => {
  beforeEach(() => jest.resetAllMocks());

  it('resolves .envschema.json when present', () => {
    mockedFs.existsSync.mockImplementation((p) =>
      (p as string).endsWith('.envschema.json')
    );
    const result = resolveSchemaPath('/project');
    expect(result).toBe(path.join('/project', '.envschema.json'));
  });

  it('throws SchemaLoadError when no schema file found', () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(() => resolveSchemaPath('/project')).toThrow(SchemaLoadError);
  });
});
