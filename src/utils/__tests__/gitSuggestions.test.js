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
- feature/optimize-use-login-code
- refactor/use-login-hook

### Suggested Git Commit Messages
- feat(auth): optimize useLogin code
- refactor(auth): simplify login hook logic
    `;

    const { branches, commits } = extractOrGenerateGitSuggestions(sampleOutput);
    expect(branches).toContain('feature/optimize-use-login-code');
    expect(branches).toContain('refactor/use-login-hook');
    expect(commits).toContain('feat(auth): optimize useLogin code');
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
