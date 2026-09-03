import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SYSTEM_PROMPT,
  TASK_TYPES,
  STORAGE_KEYS,
  AVAILABLE_MODELS,
  GROQ_CONFIG,
  GEMINI_CONFIG,
  MISTRAL_CONFIG,
  MAX_HISTORY,
} from '../constants';

describe('constants', () => {
  it('DEFAULT_SYSTEM_PROMPT is a non-empty string', () => {
    expect(typeof DEFAULT_SYSTEM_PROMPT).toBe('string');
    expect(DEFAULT_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it('TASK_TYPES has a placeholder first option and 6 types', () => {
    expect(TASK_TYPES).toHaveLength(7);
    expect(TASK_TYPES[0]).toEqual({ value: '', label: 'Select type…' });
  });

  it('STORAGE_KEYS all have pap_ prefix', () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(key).toMatch(/^pap_/);
    });
  });

  it('AVAILABLE_MODELS has entries with value and label', () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThanOrEqual(3);
    AVAILABLE_MODELS.forEach((m) => {
      expect(m).toHaveProperty('value');
      expect(m).toHaveProperty('label');
    });
  });

  it('GROQ_CONFIG has correct shape', () => {
    expect(GROQ_CONFIG).toMatchObject({
      endpoint: expect.stringContaining('groq.com'),
      model: expect.any(String),
      maxTokens: expect.any(Number),
      temperature: expect.any(Number),
    });
  });

  it('GEMINI_CONFIG has endpointBase', () => {
    expect(GEMINI_CONFIG.endpointBase).toContain('googleapis.com');
  });

  it('MISTRAL_CONFIG has endpoint', () => {
    expect(MISTRAL_CONFIG.endpoint).toContain('mistral.ai');
  });

  it('MAX_HISTORY is 10', () => {
    expect(MAX_HISTORY).toBe(10);
  });
});
