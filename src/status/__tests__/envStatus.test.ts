import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getEnvStatus } from '../envStatus';

function makeTempFile(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlock-status-'));
  const file = path.join(dir, '.env');
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('getEnvStatus', () => {
  it('returns exists=false for missing file', () => {
    const result = getEnvStatus('/nonexistent/path/.env');
    expect(result.exists).toBe(false);
    expect(result.readable).toBe(false);
    expect(result.totalKeys).toBe(0);
  });

  it('reports filled and empty values correctly', () => {
    const file = makeTempFile('KEY1=value1\nKEY2=\nKEY3=hello\n');
    const result = getEnvStatus(file);
    expect(result.exists).toBe(true);
    expect(result.readable).toBe(true);
    expect(result.totalKeys).toBe(3);
    expect(result.filledValues).toBe(2);
    expect(result.emptyValues).toBe(1);
  });

  it('ignores comment lines', () => {
    const file = makeTempFile('# comment\nKEY=val\n');
    const result = getEnvStatus(file);
    expect(result.totalKeys).toBe(1);
    expect(result.entries[0].key).toBe('KEY');
  });

  it('ignores blank lines', () => {
    const file = makeTempFile('\n\nKEY=val\n\n');
    const result = getEnvStatus(file);
    expect(result.totalKeys).toBe(1);
  });

  it('records correct line numbers', () => {
    const file = makeTempFile('# comment\nKEY1=a\nKEY2=\n');
    const result = getEnvStatus(file);
    expect(result.entries[0].lineNumber).toBe(2);
    expect(result.entries[1].lineNumber).toBe(3);
  });

  it('marks hasValue correctly', () => {
    const file = makeTempFile('A=hello\nB=\n');
    const result = getEnvStatus(file);
    const a = result.entries.find((e) => e.key === 'A')!;
    const b = result.entries.find((e) => e.key === 'B')!;
    expect(a.hasValue).toBe(true);
    expect(a.isEmpty).toBe(false);
    expect(b.hasValue).toBe(false);
    expect(b.isEmpty).toBe(true);
  });

  it('handles file with all empty values', () => {
    const file = makeTempFile('X=\nY=\nZ=\n');
    const result = getEnvStatus(file);
    expect(result.emptyValues).toBe(3);
    expect(result.filledValues).toBe(0);
  });
});
