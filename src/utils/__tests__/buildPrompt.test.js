import { describe, it, expect } from 'vitest';
import { buildUserMessage, buildPromptPayload, buildCustomUserMessage } from '../buildPrompt';

describe('buildUserMessage', () => {
  it('includes the header line', () => {
    const result = buildUserMessage({ issue: 'test' });
    expect(result).toContain('Convert this developer context into one optimised AI prompt:');
  });

  it('includes issue field', () => {
    const result = buildUserMessage({ issue: 'NullPointerException' });
    expect(result).toContain('Issue:  NullPointerException');
  });

  it('skips empty fields', () => {
    const result = buildUserMessage({ issue: 'test', fileName: '', className: '' });
    expect(result).not.toContain('File:');
    expect(result).not.toContain('Class:');
    expect(result).toContain('Issue:  test');
  });

  it('includes fileName when provided', () => {
    const result = buildUserMessage({ issue: 'x', fileName: 'UserService.java' });
    expect(result).toContain('File:   UserService.java');
  });

  it('includes className when provided', () => {
    const result = buildUserMessage({ issue: 'x', className: 'UserService' });
    expect(result).toContain('Class:  UserService');
  });

  it('includes methodName when provided', () => {
    const result = buildUserMessage({ issue: 'x', methodName: 'getUserById' });
    expect(result).toContain('Method: getUserById');
  });

  it('formats a single line number', () => {
    const result = buildUserMessage({ issue: 'x', lineNumber: '142' });
    expect(result).toContain('Line:   142');
  });

  it('formats a line number range with hyphen', () => {
    const result = buildUserMessage({ issue: 'x', lineNumber: '10-25' });
    expect(result).toContain('Lines:  10–25');
  });

  it('formats a line number range with spaced hyphen', () => {
    const result = buildUserMessage({ issue: 'x', lineNumber: '10 - 25' });
    expect(result).toContain('Lines:  10–25');
  });

  it('formats a line number range with em-dash', () => {
    const result = buildUserMessage({ issue: 'x', lineNumber: '10–25' });
    expect(result).toContain('Lines:  10–25');
  });

  it('includes task name alone', () => {
    const result = buildUserMessage({ issue: 'x', taskName: 'AB#4821' });
    expect(result).toContain('Task:   AB#4821');
  });

  it('includes task name with type', () => {
    const result = buildUserMessage({ issue: 'x', taskName: 'AB#4821', taskType: 'Bug fix' });
    expect(result).toContain('Task:   AB#4821 (Bug fix)');
  });

  it('includes task type alone', () => {
    const result = buildUserMessage({ issue: 'x', taskType: 'Refactor' });
    expect(result).toContain('Task:   Refactor');
  });

  it('includes task description', () => {
    const result = buildUserMessage({ issue: 'x', taskDesc: 'Add null guard' });
    expect(result).toContain('Desc:   Add null guard');
  });

  it('handles all fields filled', () => {
    const result = buildUserMessage({
      fileName: 'App.java',
      className: 'App',
      methodName: 'main',
      lineNumber: '42',
      taskName: 'AB#1',
      taskType: 'Feature',
      taskDesc: 'Do something',
      issue: 'Broken',
    });
    expect(result).toContain('File:   App.java');
    expect(result).toContain('Class:  App');
    expect(result).toContain('Method: main');
    expect(result).toContain('Line:   42');
    expect(result).toContain('Task:   AB#1 (Feature)');
    expect(result).toContain('Desc:   Do something');
    expect(result).toContain('Issue:  Broken');
  });

  it('trims whitespace from values', () => {
    const result = buildUserMessage({ issue: '  test  ', fileName: '  file.java  ' });
    expect(result).toContain('File:   file.java');
    expect(result).toContain('Issue:  test');
  });
});

describe('buildPromptPayload', () => {
  it('returns object with systemPrompt and userMessage', () => {
    const result = buildPromptPayload('sys', { issue: 'test' });
    expect(result).toEqual({
      systemPrompt: 'sys',
      userMessage: expect.stringContaining('Issue:  test'),
    });
  });
});

describe('buildCustomUserMessage', () => {
  const schema = [
    { id: 'f1', label: 'File' },
    { id: 'f2', label: 'Description' },
    { id: 'f3', label: 'Tags' },
  ];

  it('includes the header line', () => {
    const result = buildCustomUserMessage(schema, { f1: 'app.js', f2: '', f3: '' });
    expect(result).toContain('Convert this developer context into one optimised AI prompt:');
  });

  it('only includes non-empty values', () => {
    const result = buildCustomUserMessage(schema, { f1: 'app.js', f2: '', f3: 'urgent' });
    expect(result).toContain('File:      app.js');
    expect(result).not.toContain('Description');
    expect(result).toContain('Tags:      urgent');
  });

  it('pads labels under 10 chars', () => {
    const result = buildCustomUserMessage(schema, { f1: 'x', f2: '', f3: '' });
    expect(result).toContain('File:      x');
  });

  it('handles null and undefined values', () => {
    const result = buildCustomUserMessage(schema, { f1: null, f2: undefined, f3: 'ok' });
    expect(result).toContain('Tags:      ok');
    expect(result).not.toContain('File:');
    expect(result).not.toContain('Description');
  });

  it('returns header only when all values are empty', () => {
    const result = buildCustomUserMessage(schema, { f1: '', f2: '', f3: '' });
    expect(result).toBe('Convert this developer context into one optimised AI prompt:\n');
  });

  it('handles empty schema', () => {
    const result = buildCustomUserMessage([], {});
    expect(result).toBe('Convert this developer context into one optimised AI prompt:\n');
  });
});
