import { describe, it, expect } from '@jest/globals';
import { EnvParser } from '../envParser';

describe('EnvParser', () => {
  describe('parse', () => {
    it('should parse simple key-value pairs', () => {
      const content = 'DATABASE_URL=postgres://localhost\nAPI_KEY=secret123';
      const result = EnvParser.parse(content);

      expect(result.variables.size).toBe(2);
      expect(result.variables.get('DATABASE_URL')).toEqual({
        key: 'DATABASE_URL',
        value: 'postgres://localhost',
        lineNumber: 1,
        hasQuotes: false
      });
      expect(result.variables.get('API_KEY')).toEqual({
        key: 'API_KEY',
        value: 'secret123',
        lineNumber: 2,
        hasQuotes: false
      });
    });

    it('should handle quoted values', () => {
      const content = 'MESSAGE="Hello World"\nPATH=\'/usr/bin\'';
      const result = EnvParser.parse(content);

      expect(result.variables.get('MESSAGE')).toEqual({
        key: 'MESSAGE',
        value: 'Hello World',
        lineNumber: 1,
        hasQuotes: true
      });
      expect(result.variables.get('PATH')).toEqual({
        key: 'PATH',
        value: '/usr/bin',
        lineNumber: 2,
        hasQuotes: true
      });
    });

    it('should skip comments and empty lines', () => {
      const content = '# Configuration\n\nDEBUG=true\n# Another comment\n\nPORT=3000';
      const result = EnvParser.parse(content);

      expect(result.variables.size).toBe(2);
      expect(result.comments.length).toBe(2);
      expect(result.comments).toContain('# Configuration');
      expect(result.comments).toContain('# Another comment');
    });

    it('should detect duplicate keys', () => {
      const content = 'PORT=3000\nHOST=localhost\nPORT=8080';
      const result = EnvParser.parse(content);

      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toEqual({
        line: 3,
        message: 'Duplicate key "PORT" found'
      });
    });

    it('should detect invalid syntax', () => {
      const content = 'VALID=true\ninvalid line without equals\nANOTHER=value';
      const result = EnvParser.parse(content);

      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toEqual({
        line: 2,
        message: 'Invalid syntax: "invalid line without equals"'
      });
    });

    it('should handle values with spaces', () => {
      const content = 'APP_NAME=My Application\nDESC="Multi word description"';
      const result = EnvParser.parse(content);

      expect(result.variables.get('APP_NAME')?.value).toBe('My Application');
      expect(result.variables.get('DESC')?.value).toBe('Multi word description');
    });
  });
});
