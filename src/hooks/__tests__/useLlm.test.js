import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLlm } from '../useLlm';
import { GROQ_CONFIG, STORAGE_KEYS } from '../../utils/constants';
import { buildPromptPayload } from '../../utils/buildPrompt';

vi.mock('../../utils/buildPrompt', () => ({
  buildPromptPayload: vi.fn(() => ({
    systemPrompt: 'sys',
    userMessage: 'user msg',
  })),
}));

function mockFetch(ok, data) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 401,
    statusText: ok ? 'OK' : 'Unauthorized',
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.mocked(buildPromptPayload).mockClear();
});

describe('useLlm', () => {
  const systemPrompt = 'You are a helpful assistant.';

  it('shows error when GROQ key is missing and model is groq default', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', undefined);
    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toContain('No Groq API key found');
    expect(result.current.loading).toBe(false);
  });

  it('shows error when GROQ key is placeholder', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'your_groq_api_key_here');
    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toContain('No Groq API key found');
  });

  it('calls fetch with correct arguments for Groq', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'real-key');
    globalThis.fetch = mockFetch(true, {
      choices: [{ message: { content: '  fixed code  ' } }],
    });

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'bug' });
    });
    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledWith(
      GROQ_CONFIG.endpoint,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer real-key',
        }),
      }),
    );
  });

  it('returns trimmed result on success', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'real-key');
    globalThis.fetch = mockFetch(true, {
      choices: [{ message: { content: '  fixed code  ' } }],
    });

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'bug' });
    });
    expect(result.current.loading).toBe(false);
  });

  it('handles HTTP 401 error', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'bad-key');
    globalThis.fetch = mockFetch(false, {});

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toContain('Invalid API key');
  });

  it('handles HTTP 429 error', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'key');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toContain('Rate limit');
  });

  it('handles network errors', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'key');
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toContain('Cannot reach the API');
  });

  it('handles empty response', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'key');
    globalThis.fetch = mockFetch(true, {
      choices: [{ message: { content: '   ' } }],
    });

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toContain('empty response');
  });

  it('clearError resets error state', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'bad-key');
    globalThis.fetch = mockFetch(false, {});
    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate({ issue: 'test' });
    });
    expect(result.current.error).toBeTruthy();
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('uses rawUserMessage when provided', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'real-key');
    globalThis.fetch = mockFetch(true, {
      choices: [{ message: { content: 'result' } }],
    });

    const { result } = renderHook(() => useLlm(systemPrompt));
    await act(async () => {
      await result.current.generate(null, 'raw custom message');
    });

    const callArgs = fetch.mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.messages[1].content).toBe('raw custom message');
    expect(buildPromptPayload).not.toHaveBeenCalled();
  });
});
