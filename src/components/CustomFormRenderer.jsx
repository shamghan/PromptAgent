import { useState } from 'react';

function FieldInput({ field, value, onChange, error }) {
  const baseClass = `field ${error ? 'border-red-400 ring-4 ring-red-400/10 focus:border-red-500 focus:ring-red-500/10' : ''}`;
  const handleChange = (e) => onChange(field.id, e.target.value);

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={field.id}
          name={field.id}
          rows={3}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder || ''}
          className={`${baseClass} resize-y min-h-[80px]`}
        />
      );
    case 'select': {
      const options = Array.isArray(field.options) ? field.options : [];
      return (
        <div className="relative">
          <select
            id={field.id}
            name={field.id}
            value={value}
            onChange={handleChange}
            className={`${baseClass} appearance-none pr-10 cursor-pointer`}
          >
            <option value="">Select…</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      );
    }
    default:
      return (
        <input
          id={field.id}
          name={field.id}
          type={field.type}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder || ''}
          className={baseClass}
        />
      );
  }
}

function SectionHeading({ color, children }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-1 h-5 rounded-full ${color}`} />
      <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">
        {children}
      </h2>
    </div>
  );
}

export default function CustomFormRenderer({
  schema, values, onChange, onSubmit, onClear,
  onToggleHistory, onOpenSettings, onOpenBuilder,
  loading, error,
}) {
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    for (const field of schema) {
      if (field.required) {
        const val = String(values[field.id] ?? '').trim();
        if (!val) errors[field.id] = `${field.label} is required.`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) onSubmit();
  }

  function handleClear() {
    setFieldErrors({});
    onClear();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <SectionHeading color="bg-violet-500">Custom Form</SectionHeading>

        {schema.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500">
            <p className="text-sm font-semibold">Your custom form is empty.</p>
            <p className="text-xs mt-1">Open Form Builder to add fields.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {schema.map((field) => (
              <div key={field.id} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                <label htmlFor={field.id} className="field-label flex items-center gap-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 font-bold">*</span>}
                </label>
                <FieldInput
                  field={field}
                  value={values[field.id] ?? ''}
                  onChange={onChange}
                  error={!!fieldErrors[field.id]}
                />
                {fieldErrors[field.id] && (
                  <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="animate-fade-up bg-red-50/90 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-medium backdrop-blur-sm">
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button type="submit" disabled={loading || schema.length === 0} className="btn-primary">
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {loading ? 'Generating…' : 'Generate Prompt'}
        </button>

        <button type="button" onClick={handleClear} className="btn-ghost">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>

        <div className="flex-1" />

        <button type="button" onClick={onToggleHistory} className="btn-ghost">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </button>

        <button type="button" onClick={onOpenBuilder} className="btn-ghost text-brand-700 dark:text-brand-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Form Builder
        </button>

        <button type="button" onClick={onOpenSettings} className="btn-ghost">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </form>
  );
}
