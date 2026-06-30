/**
 * CustomFormBuilderModal.jsx
 * A full modal for designing a custom input form.
 * Users can add, edit, reorder, and delete fields.
 */

import { useEffect, useState } from 'react';

const FIELD_TYPES = [
  { value: 'text',     label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number',   label: 'Number' },
  { value: 'select',   label: 'Select (dropdown)' },
  { value: 'email',    label: 'Email' },
  { value: 'url',      label: 'URL' },
];

function newField() {
  return {
    id: crypto.randomUUID(),
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    options: '',   // comma-separated string, converted on save
  };
}

function FieldRow({ field, index, total, onChange, onDelete, onMove }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-300">
      {/* ── Row header ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
        {/* Order arrows */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Field index badge */}
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold shrink-0">
          {index + 1}
        </span>

        {/* Label preview */}
        <span className="flex-1 text-sm font-semibold text-slate-700 truncate">
          {field.label || <span className="text-slate-400 font-normal italic">Untitled field</span>}
        </span>

        {/* Type badge */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
          {FIELD_TYPES.find(t => t.value === field.type)?.label ?? field.type}
        </span>

        {/* Required badge */}
        {field.required && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
            Required
          </span>
        )}

        {/* Expand / Collapse */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* ── Row body ── */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Label */}
          <div>
            <label className="field-label">Label <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="field"
              placeholder="e.g. Environment, Error message…"
              value={field.label}
              onChange={e => onChange(field.id, 'label', e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="field-label">Field type</label>
            <div className="relative">
              <select
                className="field appearance-none pr-10 cursor-pointer"
                value={field.type}
                onChange={e => onChange(field.id, 'type', e.target.value)}
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Placeholder */}
          <div>
            <label className="field-label">Placeholder</label>
            <input
              type="text"
              className="field"
              placeholder="Hint shown inside the field"
              value={field.placeholder}
              onChange={e => onChange(field.id, 'placeholder', e.target.value)}
            />
          </div>

          {/* Options (select only) */}
          {field.type === 'select' ? (
            <div>
              <label className="field-label">Options <span className="text-slate-400 font-normal normal-case tracking-normal">(comma-separated)</span></label>
              <input
                type="text"
                className="field"
                placeholder="Option A, Option B, Option C"
                value={field.options}
                onChange={e => onChange(field.id, 'options', e.target.value)}
              />
            </div>
          ) : (
            /* Required toggle */
            <div className="flex items-end pb-0.5">
              <button
                type="button"
                onClick={() => onChange(field.id, 'required', !field.required)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${field.required ? 'bg-brand-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${field.required ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="ml-3 text-sm font-medium text-slate-700">Required field</span>
            </div>
          )}

          {/* Required toggle when type === select (needs its own row) */}
          {field.type === 'select' && (
            <div className="flex items-center col-span-full">
              <button
                type="button"
                onClick={() => onChange(field.id, 'required', !field.required)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${field.required ? 'bg-brand-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${field.required ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="ml-3 text-sm font-medium text-slate-700">Required field</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomFormBuilderModal({ isOpen, schema: savedSchema, onSave, onClose }) {
  const [fields, setFields] = useState([]);
  const [saveError, setSaveError] = useState('');

  // Sync draft with saved schema whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFields(savedSchema.map(f => ({ ...f, options: Array.isArray(f.options) ? f.options.join(', ') : f.options || '' })));
      setSaveError('');
    }
  }, [isOpen, savedSchema]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  function handleAdd() {
    setFields(prev => [...prev, newField()]);
    setSaveError('');
  }

  function handleChange(id, key, value) {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  }

  function handleDelete(id) {
    setFields(prev => prev.filter(f => f.id !== id));
  }

  function handleMove(index, dir) {
    setFields(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave() {
    // Validate: all fields must have a label
    const unlabelled = fields.findIndex(f => !f.label.trim());
    if (unlabelled !== -1) {
      setSaveError(`Field ${unlabelled + 1} is missing a label.`);
      return;
    }
    // Convert options string → array
    const normalised = fields.map(f => ({
      ...f,
      label: f.label.trim(),
      placeholder: f.placeholder.trim(),
      options: f.type === 'select'
        ? f.options.split(',').map(o => o.trim()).filter(Boolean)
        : [],
    }));
    onSave(normalised);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-float flex flex-col overflow-hidden animate-fade-up">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Form Builder</h2>
              <p className="text-xs font-medium text-slate-500">Design your custom input form</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fields.length > 0 && (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {fields.length} field{fields.length !== 1 ? 's' : ''}
              </span>
            )}
            <button onClick={onClose} className="btn-icon bg-slate-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
          {fields.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500">No fields yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Field" to start building your form</p>
            </div>
          )}

          {fields.map((field, index) => (
            <FieldRow
              key={field.id}
              field={field}
              index={index}
              total={fields.length}
              onChange={handleChange}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}

          {/* Add field button (inline) */}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-semibold text-slate-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          {saveError && (
            <p className="text-xs font-semibold text-red-600 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {saveError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setFields([]); setSaveError(''); }}
              className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              Clear all
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary bg-violet-600 hover:bg-violet-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
