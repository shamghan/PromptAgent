/**
 * useCustomForm.js
 * Manages the custom form schema (field list) and per-session values.
 * Schema is persisted to localStorage; values reset on page load.
 */

import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const SCHEMA_KEY = STORAGE_KEYS.CUSTOM_SCHEMA;

function loadSchema() {
  try {
    const raw = localStorage.getItem(SCHEMA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSchema(schema) {
  try {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify(schema));
  } catch {}
}

/** Build a blank values object from a schema */
function blankValues(schema) {
  return Object.fromEntries(schema.map((f) => [f.id, '']));
}

export function useCustomForm() {
  const [schema, setSchema] = useState(loadSchema);
  const [customValues, setCustomValues] = useState(() => blankValues(loadSchema()));

  const saveNewSchema = useCallback((newSchema) => {
    setSchema(newSchema);
    saveSchema(newSchema);
    // Reset values to match new schema shape
    setCustomValues(blankValues(newSchema));
  }, []);

  const handleCustomChange = useCallback((id, value) => {
    setCustomValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetCustomValues = useCallback(() => {
    setCustomValues(blankValues(schema));
  }, [schema]);

  return {
    schema,
    customValues,
    saveNewSchema,
    handleCustomChange,
    resetCustomValues,
    hasSchema: schema.length > 0,
  };
}
