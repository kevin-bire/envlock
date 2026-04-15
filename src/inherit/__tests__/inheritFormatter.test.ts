import {
  formatInheritedEntry,
  formatOverriddenEntry,
  formatAddedEntry,
  formatInheritResult,
  formatInheritSummary,
} from '../inheritFormatter';
import { InheritResult } from '../envInherit';

const mockResult: InheritResult = {
  base: '.env',
  override: '.env.prod',
  merged: {
    APP_NAME: 'myapp',
    DB_HOST: 'prod.db.example.com',
    LOG_LEVEL: 'error',
    NEW_KEY: 'new_value',
  },
  inherited: ['APP_NAME'],
  overridden: ['DB_HOST', 'LOG_LEVEL'],
  added: ['NEW_KEY'],
};

describe('formatInheritedEntry', () => {
  it('formats an inherited entry with marker', () => {
    const out = formatInheritedEntry('APP_NAME', 'myapp');
    expect(out).toContain('APP_NAME');
    expect(out).toContain('myapp');
    expect(out).toContain('inherited');
  });
});

describe('formatOverriddenEntry', () => {
  it('formats an overridden entry showing transition', () => {
    const out = formatOverriddenEntry('DB_HOST', 'localhost', 'prod.db');
    expect(out).toContain('DB_HOST');
    expect(out).toContain('overridden');
    expect(out).toContain('→');
  });
});

describe('formatAddedEntry', () => {
  it('formats an added entry with marker', () => {
    const out = formatAddedEntry('NEW_KEY', 'new_value');
    expect(out).toContain('NEW_KEY');
    expect(out).toContain('new_value');
    expect(out).toContain('new in override');
  });
});

describe('formatInheritResult', () => {
  it('includes base and override names in header', () => {
    const out = formatInheritResult(mockResult);
    expect(out).toContain('.env');
    expect(out).toContain('.env.prod');
  });

  it('lists inherited keys section', () => {
    const out = formatInheritResult(mockResult);
    expect(out).toContain('APP_NAME');
    expect(out).toContain('Inherited from base');
  });

  it('lists overridden keys section', () => {
    const out = formatInheritResult(mockResult);
    expect(out).toContain('Overridden keys');
    expect(out).toContain('DB_HOST');
  });

  it('lists added keys section', () => {
    const out = formatInheritResult(mockResult);
    expect(out).toContain('Added by override');
    expect(out).toContain('NEW_KEY');
  });

  it('omits sections when empty', () => {
    const emptyResult: InheritResult = {
      ...mockResult,
      inherited: [],
      overridden: [],
      added: [],
    };
    const out = formatInheritResult(emptyResult);
    expect(out).not.toContain('Inherited from base');
    expect(out).not.toContain('Overridden keys');
    expect(out).not.toContain('Added by override');
  });
});

describe('formatInheritSummary', () => {
  it('includes counts for all categories', () => {
    const out = formatInheritSummary(mockResult);
    expect(out).toContain('Inherited: 1');
    expect(out).toContain('Overridden: 2');
    expect(out).toContain('Added: 1');
    expect(out).toContain('Total keys: 4');
  });
});
