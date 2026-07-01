/**
 * useCustomForm.js
 * Manages custom form templates and active template values.
 * Templates are persisted to localStorage; values reset on page load.
 */

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const SCHEMA_KEY = STORAGE_KEYS.CUSTOM_SCHEMA;

function loadTemplates() {
  try {
    const raw = localStorage.getItem(SCHEMA_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    
    // Migration: If it's an array of fields (old format), wrap it in a template
    if (parsed.length > 0 && !parsed[0].schema) {
      return [{
        id: 'default-template',
        name: 'Default Template',
        schema: parsed
      }];
    }
    
    return parsed;
  } catch {
    return [];
  }
}

function saveTemplates(templates) {
  try {
    localStorage.setItem(SCHEMA_KEY, JSON.stringify(templates));
  } catch {}
}

/** Build a blank values object from a schema */
function blankValues(schema) {
  return Object.fromEntries(schema.map((f) => [f.id, '']));
}

export function useCustomForm() {
  const [templates, setTemplates] = useState(loadTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState(templates.length > 0 ? templates[0].id : null);
  
  // Find the active template's schema, or fallback to an empty array
  const activeSchema = templates.find(t => t.id === activeTemplateId)?.schema || [];
  
  const [customValues, setCustomValues] = useState(() => blankValues(activeSchema));

  // Whenever active template changes, reset the values
  useEffect(() => {
    setCustomValues(blankValues(activeSchema));
  }, [activeTemplateId, activeSchema]); // We depend on activeSchema reference, but it's safe if templates update cleanly

  const saveTemplatesState = useCallback((newTemplates) => {
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
    if (newTemplates.length > 0 && !newTemplates.find(t => t.id === activeTemplateId)) {
      setActiveTemplateId(newTemplates[0].id);
    }
  }, [activeTemplateId]);

  const handleCustomChange = useCallback((id, value) => {
    setCustomValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetCustomValues = useCallback(() => {
    setCustomValues(blankValues(activeSchema));
  }, [activeSchema]);

  return {
    templates,
    activeTemplateId,
    setActiveTemplateId,
    schema: activeSchema,
    customValues,
    saveTemplates: saveTemplatesState,
    handleCustomChange,
    resetCustomValues,
    hasSchema: activeSchema.length > 0,
    hasTemplates: templates.length > 0,
  };
}
