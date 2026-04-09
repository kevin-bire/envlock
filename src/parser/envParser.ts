/**
 * Environment file parser
 * Parses .env files and extracts key-value pairs with metadata
 */

export interface EnvVariable {
  key: string;
  value: string;
  lineNumber: number;
  hasQuotes: boolean;
}

export interface ParseResult {
  variables: Map<string, EnvVariable>;
  comments: string[];
  errors: ParseError[];
}

export interface ParseError {
  line: number;
  message: string;
}

/**
 * Parses .env file content into structured data
 */
export class EnvParser {
  private static readonly ENV_LINE_REGEX = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;
  private static readonly COMMENT_REGEX = /^\s*#/;
  private static readonly QUOTED_VALUE_REGEX = /^["'](.*)["']$/;

  /**
   * Parse .env file content
   */
  static parse(content: string): ParseResult {
    const variables = new Map<string, EnvVariable>();
    const comments: string[] = [];
    const errors: ParseError[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Skip empty lines
      if (trimmedLine === '') {
        return;
      }

      // Handle comments
      if (this.COMMENT_REGEX.test(trimmedLine)) {
        comments.push(trimmedLine);
        return;
      }

      // Parse variable assignment
      const match = trimmedLine.match(this.ENV_LINE_REGEX);
      if (match) {
        const [, key, rawValue] = match;
        const quotedMatch = rawValue.match(this.QUOTED_VALUE_REGEX);
        const value = quotedMatch ? quotedMatch[1] : rawValue;
        const hasQuotes = !!quotedMatch;

        if (variables.has(key)) {
          errors.push({
            line: lineNumber,
            message: `Duplicate key "${key}" found`
          });
        }

        variables.set(key, {
          key,
          value,
          lineNumber,
          hasQuotes
        });
      } else {
        errors.push({
          line: lineNumber,
          message: `Invalid syntax: "${trimmedLine}"`
        });
      }
    });

    return { variables, comments, errors };
  }
}
