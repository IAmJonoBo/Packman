import matter from 'gray-matter';
import YAML from 'yaml';
import type { FrontmatterData } from './types.js';

export interface ParsedFrontmatter {
  frontmatter: FrontmatterData;
  body: string;
  raw: string;
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const parsed = matter(raw, {
    engines: {
      yaml: (input: string) => YAML.parse(input) as Record<string, unknown>,
    },
  });

  return {
    frontmatter: (parsed.data ?? {}) as FrontmatterData,
    body: parsed.content,
    raw,
  };
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
