import { describe, it, expect } from 'vitest';
import { extractOrGenerateGitSuggestions } from '../gitSuggestions';

describe('gitSuggestions', () => {
  it('returns empty lists for invalid or empty output', () => {
    const result = extractOrGenerateGitSuggestions('');
    expect(result).toEqual({ branches: [], commits: [] });
  });

  it('parses explicit Markdown git sections from LLM output', () => {
    const sampleOutput = `
Here is your prompt.

### Suggested Git Branches
- feature/optimize-low-quality-code
- refactor/codebase-performance

### Suggested Git Commit Messages
- feat(codebase): optimize low quality code
- refactor(codebase): improve performance and readability
    `;

    const { branches, commits } = extractOrGenerateGitSuggestions(sampleOutput);
    expect(branches).toContain('feature/optimize-low-quality-code');
    expect(branches).toContain('refactor/codebase-performance');
    expect(commits).toContain('feat(codebase): optimize low quality code');
  });

  it('filters stop words and creates clean heading-based branch names', () => {
    const inputs = {
      taskType: 'Performance',
      issue: 'Review the entire codebase for performance bottlenecks and low-quality code.',
    };
    const { branches, commits } = extractOrGenerateGitSuggestions('Prompt text', inputs);
    expect(branches[0]).not.toContain('i-want-you-to');
    expect(branches[0]).not.toContain('the-entire-codebase');
    expect(branches[0]).toContain('perf/');
    expect(commits[0]).toContain('perf(');
  });

  it('generates Bug fix specific suggestions', () => {
    const inputs = {
      taskType: 'Bug fix',
      methodName: 'useLogin',
      issue: 'Fix authentication failure on login submit',
    };
    const { branches, commits } = extractOrGenerateGitSuggestions('Prompt text', inputs);
    expect(branches[0]).toContain('fix/');
    expect(commits[0]).toContain('fix(');
  });

  it('generates Refactor specific suggestions', () => {
    const inputs = {
      taskType: 'Refactor',
      methodName: 'useLogin',
      issue: 'Simplify state hooks in useLogin',
    };
    const { branches, commits } = extractOrGenerateGitSuggestions('Prompt text', inputs);
    expect(branches[0]).toContain('refactor/');
    expect(commits[0]).toContain('refactor(');
  });

  it('generates Performance specific suggestions', () => {
    const inputs = {
      taskType: 'Performance',
      methodName: 'useLogin',
      issue: 'Speed up initial render of login form',
    };
    const { branches, commits } = extractOrGenerateGitSuggestions('Prompt text', inputs);
    expect(branches[0]).toContain('perf/');
    expect(commits[0]).toContain('perf(');
  });

  it('generates Unit test specific suggestions', () => {
    const inputs = {
      taskType: 'Unit test',
      methodName: 'useLogin',
      issue: 'Add coverage for login error states',
    };
    const { branches, commits } = extractOrGenerateGitSuggestions('Prompt text', inputs);
    expect(branches[0]).toContain('test/');
    expect(commits[0]).toContain('test(');
  });
});
