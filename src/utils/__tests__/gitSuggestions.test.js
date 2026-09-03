import { describe, it, expect } from 'vitest';
import { extractOrGenerateGitSuggestions } from '../gitSuggestions';

describe('gitSuggestions', () => {
  it('returns empty lists for invalid or empty output', () => {
    const result = extractOrGenerateGitSuggestions('');
    expect(result).toEqual({ branches: [], commits: [] });
  });

  it('parses and formats git branch names starting with feature/ and 5-9 words', () => {
    const sampleOutput = `
Review the entire codebase for performance bottlenecks and low-quality code.
    `;
    const inputs = {
      issue: 'Review the entire codebase for performance bottlenecks and low-quality code.',
    };

    const { branches, commits } = extractOrGenerateGitSuggestions(sampleOutput, inputs);

    expect(branches.length).toBeGreaterThan(0);
    expect(commits.length).toBeGreaterThan(0);

    branches.forEach((b) => {
      expect(b.startsWith('feature/')).toBe(true);
      const words = b.replace('feature/', '').split('-');
      expect(words.length).toBeGreaterThanOrEqual(5);
      expect(words.length).toBeLessThanOrEqual(9);
    });

    commits.forEach((c) => {
      const words = c.split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(7);
      expect(words.length).toBeLessThanOrEqual(18);
    });
  });

  it('enforces feature/ prefix and word count bounds on generated suggestions', () => {
    const inputs = {
      taskType: 'Bug fix',
      methodName: 'useLogin',
      issue: 'Fix authentication failure on login submit',
    };

    const { branches, commits } = extractOrGenerateGitSuggestions('Prompt text', inputs);

    branches.forEach((b) => {
      expect(b.startsWith('feature/')).toBe(true);
      const words = b.replace('feature/', '').split('-');
      expect(words.length).toBeGreaterThanOrEqual(5);
      expect(words.length).toBeLessThanOrEqual(9);
    });

    commits.forEach((c) => {
      const words = c.split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(7);
      expect(words.length).toBeLessThanOrEqual(18);
    });
  });
});
