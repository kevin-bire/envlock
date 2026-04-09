import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createAuditEntry,
  formatAuditEntry,
  appendAuditLog,
  readAuditLog,
} from '../auditLog';

describe('createAuditEntry', () => {
  it('creates an entry with required fields', () => {
    const entry = createAuditEntry('validate', ['.env'], 'success');
    expect(entry.action).toBe('validate');
    expect(entry.files).toEqual(['.env']);
    expect(entry.result).toBe('success');
    expect(entry.timestamp).toBeTruthy();
    expect(entry.details).toBeUndefined();
  });

  it('includes optional details when provided', () => {
    const entry = createAuditEntry('sync', ['.env', '.env.prod'], 'failure', 'Missing keys');
    expect(entry.details).toBe('Missing keys');
  });
});

describe('formatAuditEntry', () => {
  it('formats entry as a pipe-delimited string', () => {
    const entry = createAuditEntry('diff', ['.env.local', '.env.prod'], 'warning', '3 diffs found');
    const formatted = formatAuditEntry(entry);
    expect(formatted).toContain('ACTION=diff');
    expect(formatted).toContain('RESULT=warning');
    expect(formatted).toContain('.env.local');
    expect(formatted).toContain('DETAILS=3 diffs found');
  });

  it('omits DETAILS when not provided', () => {
    const entry = createAuditEntry('schema-load', ['schema.json'], 'success');
    const formatted = formatAuditEntry(entry);
    expect(formatted).not.toContain('DETAILS');
  });
});

describe('appendAuditLog and readAuditLog', () => {
  let tmpDir: string;
  let logPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlock-audit-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates the log file and appends an entry', () => {
    const entry = createAuditEntry('validate', ['.env'], 'success');
    appendAuditLog(logPath, entry);
    expect(fs.existsSync(logPath)).toBe(true);
    const contents = fs.readFileSync(logPath, 'utf-8');
    expect(contents).toContain('ACTION=validate');
  });

  it('reads back multiple entries in order', () => {
    appendAuditLog(logPath, createAuditEntry('validate', ['.env'], 'success'));
    appendAuditLog(logPath, createAuditEntry('sync', ['.env', '.env.prod'], 'failure', 'err'));
    const entries = readAuditLog(logPath);
    expect(entries).toHaveLength(2);
    expect(entries[0].action).toBe('validate');
    expect(entries[1].action).toBe('sync');
    expect(entries[1].details).toBe('err');
  });

  it('returns empty array when log file does not exist', () => {
    const entries = readAuditLog(path.join(tmpDir, 'nonexistent.log'));
    expect(entries).toEqual([]);
  });
});
