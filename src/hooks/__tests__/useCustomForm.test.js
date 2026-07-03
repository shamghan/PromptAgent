import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomForm } from '../useCustomForm';
import { STORAGE_KEYS } from '../../utils/constants';

const SCHEMA_KEY = STORAGE_KEYS.CUSTOM_SCHEMA;

const mockTemplate = {
  id: 't1',
  name: 'Test Template',
  schema: [
    { id: 'f1', label: 'File', type: 'text' },
    { id: 'f2', label: 'Description', type: 'textarea' },
  ],
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useCustomForm', () => {
  it('starts with no templates if localStorage is empty', () => {
    const { result } = renderHook(() => useCustomForm());
    expect(result.current.templates).toEqual([]);
    expect(result.current.hasTemplates).toBe(false);
    expect(result.current.hasSchema).toBe(false);
  });

  it('loads templates from localStorage', () => {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify([mockTemplate]));
    const { result } = renderHook(() => useCustomForm());
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe('Test Template');
    expect(result.current.hasTemplates).toBe(true);
    expect(result.current.hasSchema).toBe(true);
  });

  it('migrates old flat-schema format to wrapped template', () => {
    const oldSchema = [
      { id: 'f1', label: 'Field 1', type: 'text' },
    ];
    localStorage.setItem(SCHEMA_KEY, JSON.stringify(oldSchema));
    const { result } = renderHook(() => useCustomForm());
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].id).toBe('default-template');
    expect(result.current.templates[0].name).toBe('Default Template');
    expect(result.current.templates[0].schema).toEqual(oldSchema);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(SCHEMA_KEY, 'not json');
    const { result } = renderHook(() => useCustomForm());
    expect(result.current.templates).toEqual([]);
  });

  it('initializes customValues as blank for the schema', () => {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify([mockTemplate]));
    const { result } = renderHook(() => useCustomForm());
    expect(result.current.customValues).toEqual({ f1: '', f2: '' });
  });

  it('handleCustomChange updates a single field', () => {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify([mockTemplate]));
    const { result } = renderHook(() => useCustomForm());
    act(() => {
      result.current.handleCustomChange('f1', 'app.js');
    });
    expect(result.current.customValues).toEqual({ f1: 'app.js', f2: '' });
  });

  it('saveTemplates persists and updates state', () => {
    const { result } = renderHook(() => useCustomForm());
    act(() => {
      result.current.saveTemplates([mockTemplate]);
    });
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.hasTemplates).toBe(true);
    expect(result.current.hasSchema).toBe(true);

    const stored = JSON.parse(localStorage.getItem(SCHEMA_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Test Template');
  });

  it('saveTemplates auto-selects first template when active is removed', () => {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify([mockTemplate]));
    const { result } = renderHook(() => useCustomForm());
    expect(result.current.activeTemplateId).toBe('t1');

    act(() => {
      result.current.saveTemplates([
        { id: 't2', name: 'New Template', schema: [{ id: 'f3', label: 'Field 3', type: 'text' }] },
      ]);
    });
    expect(result.current.activeTemplateId).toBe('t2');
  });

  it('resetCustomValues clears all values', () => {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify([mockTemplate]));
    const { result } = renderHook(() => useCustomForm());
    act(() => {
      result.current.handleCustomChange('f1', 'app.js');
      result.current.handleCustomChange('f2', 'desc');
    });
    expect(result.current.customValues.f1).toBe('app.js');
    act(() => {
      result.current.resetCustomValues();
    });
    expect(result.current.customValues).toEqual({ f1: '', f2: '' });
  });

  it('switching active template resets values', () => {
    localStorage.setItem(
      SCHEMA_KEY,
      JSON.stringify([
        mockTemplate,
        { id: 't2', name: 'Template 2', schema: [{ id: 'f3', label: 'Other', type: 'text' }] },
      ]),
    );
    const { result } = renderHook(() => useCustomForm());
    act(() => {
      result.current.handleCustomChange('f1', 'some file');
    });
    expect(result.current.customValues.f1).toBe('some file');
    act(() => {
      result.current.setActiveTemplateId('t2');
    });
    expect(result.current.customValues).toEqual({ f3: '' });
  });
});
