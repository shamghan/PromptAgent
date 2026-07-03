import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../useHistory';
import { STORAGE_KEYS } from '../../utils/constants';

const HISTORY_KEY = STORAGE_KEYS.HISTORY;

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useHistory', () => {
  it('starts with empty history', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('loads existing history from localStorage', () => {
    const existing = [{ id: '1', timestamp: '2024-01-01', inputs: { issue: 'test' }, output: 'out' }];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing));
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual(existing);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(HISTORY_KEY, 'invalid json');
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('addEntry prepends and saves to localStorage', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({ issue: 'bug' }, 'fixed code');
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].inputs).toEqual({ issue: 'bug' });
    expect(result.current.history[0].output).toBe('fixed code');
    expect(result.current.history[0].id).toBeDefined();
    expect(result.current.history[0].timestamp).toBeDefined();

    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].inputs.issue).toBe('bug');
  });

  it('caps history at 10 entries', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addEntry({ issue: `bug${i}` }, `out${i}`);
      }
    });
    expect(result.current.history).toHaveLength(10);
    expect(result.current.history[0].inputs.issue).toBe('bug14');
    expect(result.current.history[9].inputs.issue).toBe('bug5');
  });

  it('deleteEntry removes by id', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({ issue: 'a' }, 'out a');
    });
    const id = result.current.history[0].id;
    act(() => {
      result.current.addEntry({ issue: 'b' }, 'out b');
    });
    expect(result.current.history).toHaveLength(2);
    act(() => {
      result.current.deleteEntry(id);
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].inputs.issue).toBe('b');
  });

  it('clearHistory empties history and removes from localStorage', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({ issue: 'x' }, 'out');
    });
    expect(result.current.history).toHaveLength(1);
    act(() => {
      result.current.clearHistory();
    });
    expect(result.current.history).toHaveLength(0);
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });

  it('handles localStorage setItem quota error silently', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({ issue: 'x' }, 'out');
    });
    expect(result.current.history).toHaveLength(1);
    setItemSpy.mockRestore();
  });
});
