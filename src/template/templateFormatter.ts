import { EnvTemplate, TemplateField } from './envTemplate';

export function maskTemplateValue(value: string | undefined, sensitive: boolean): string {
  if (!value) return '';
  return sensitive ? '****' : value;
}

export function formatField(key: string, field: TemplateField, maskSensitive = true): string {
  const parts: string[] = [];

  if (field.description) {
    parts.push(`# ${field.description}`);
  }

  const tags: string[] = [];
  if (field.required) tags.push('required');
  if (field.sensitive) tags.push('sensitive');
  if (field.type) tags.push(`type:${field.type}`);
  if (tags.length > 0) {
    parts.push(`# [${tags.join(', ')}]`);
  }

  const displayValue = field.defaultValue
    ? maskTemplateValue(field.defaultValue, !!(field.sensitive && maskSensitive))
    : '';

  parts.push(`${key}=${displayValue}`);
  return parts.join('\n');
}

export function formatTemplateResult(
  template: EnvTemplate,
  maskSensitive = true
): string {
  const lines: string[] = [];

  if (template.description) {
    lines.push(`# ${template.description}`);
    lines.push('');
  }

  const entries = Object.entries(template.fields);
  entries.forEach(([key, field], index) => {
    lines.push(formatField(key, field, maskSensitive));
    if (index < entries.length - 1) {
      lines.push('');
    }
  });

  return lines.join('\n');
}

export function formatTemplateSummary(template: EnvTemplate): string {
  const total = Object.keys(template.fields).length;
  const required = Object.values(template.fields).filter((f) => f.required).length;
  const sensitive = Object.values(template.fields).filter((f) => f.sensitive).length;
  const withDefaults = Object.values(template.fields).filter(
    (f) => f.defaultValue !== undefined
  ).length;

  return [
    `Template Summary:`,
    `  Total fields : ${total}`,
    `  Required     : ${required}`,
    `  Sensitive    : ${sensitive}`,
    `  With defaults: ${withDefaults}`,
  ].join('\n');
}
