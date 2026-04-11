import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFile, WatchEvent } from '../envWatch';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('watchEnvFile', () => {
  let tmpDir: string;
  let envFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envwatch-'));
    envFile = path.join(tmpDir, '.env');
    fs.writeFileSync(envFile, 'KEY1=value1\nKEY2=value2\n');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return a watch handle with stop and filePath', () => {
    const handle = watchEnvFile(envFile, () => {});
    expect(handle.filePath).toBe(path.resolve(envFile));
    expect(typeof handle.stop).toBe('function');
    handle.stop();
  });

  it('should call callback when file changes', async () => {
    const events: WatchEvent[] = [];
    const handle = watchEnvFile(envFile, (event) => events.push(event), { debounceMs: 50 });

    await sleep(100);
    fs.writeFileSync(envFile, 'KEY1=value1\nKEY2=changed\nKEY3=new\n');
    await sleep(200);

    handle.stop();

    expect(events.length).toBeGreaterThanOrEqual(1);
    const event = events[0];
    expect(event.filePath).toBe(path.resolve(envFile));
    expect(event.changes.changed.some((c) => c.key === 'KEY2')).toBe(true);
    expect(event.changes.added.some((a) => a.key === 'KEY3')).toBe(true);
  });

  it('should not call callback when file content is unchanged', async () => {
    const events: WatchEvent[] = [];
    const handle = watchEnvFile(envFile, (event) => events.push(event), { debounceMs: 50 });

    await sleep(100);
    // Write the same content
    fs.writeFileSync(envFile, 'KEY1=value1\nKEY2=value2\n');
    await sleep(200);

    handle.stop();
    expect(events.length).toBe(0);
  });

  it('should detect removed keys', async () => {
    const events: WatchEvent[] = [];
    const handle = watchEnvFile(envFile, (event) => events.push(event), { debounceMs: 50 });

    await sleep(100);
    fs.writeFileSync(envFile, 'KEY1=value1\n');
    await sleep(200);

    handle.stop();

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].changes.removed.some((r) => r.key === 'KEY2')).toBe(true);
  });
});
