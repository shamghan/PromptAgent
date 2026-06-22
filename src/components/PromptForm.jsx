import { useRef } from 'react';
import { TASK_TYPES } from '../utils/constants';

export default function PromptForm({ inputs, setInputs, onSubmit, onClear, onToggleHistory, onOpenSettings, loading, error }) {
  const issueRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      
      {/* ── Section 1: Code Context ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Code Context</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'fileName',   label: 'File name',    placeholder: 'UserService.java',  type: 'text',   tab: 1 },
            { id: 'className',  label: 'Class name',   placeholder: 'UserService',       type: 'text',   tab: 2 },
            { id: 'methodName', label: 'Method name',  placeholder: 'getUserById',       type: 'text',   tab: 3 },
            { id: 'lineNumber', label: 'Line number',  placeholder: '142',               type: 'number', tab: 4 },
          ].map(({ id, label, placeholder, type, tab }) => (
            <div key={id}>
              <label htmlFor={id} className="field-label">{label}</label>
              <input
                id={id} name={id} type={type} tabIndex={tab}
                value={inputs[id]} onChange={handleChange}
                placeholder={placeholder} min={type === 'number' ? 1 : undefined}
                className="field"
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* ── Section 2: Azure DevOps ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Azure DevOps Task</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taskName" className="field-label">Task ID / name</label>
            <input
              id="taskName" name="taskName" type="text" tabIndex={5}
              value={inputs.taskName} onChange={handleChange}
              placeholder="AB#4821 — Add null guard in getUserById"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="taskType" className="field-label">Task type</label>
            <div className="relative">
              <select
                id="taskType" name="taskType" tabIndex={6}
                value={inputs.taskType} onChange={handleChange}
                className="field appearance-none pr-10 cursor-pointer"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* ── Section 3 & 4: Descriptions ───────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Context & Problem</h2>
        </div>

        <div>
          <label htmlFor="taskDesc" className="field-label flex items-center justify-between">
            <span>Task description</span>
            <span className="text-slate-400 font-medium normal-case tracking-normal">Paste from Azure board</span>
          </label>
          <textarea
            id="taskDesc" name="taskDesc" tabIndex={7}
            value={inputs.taskDesc} onChange={handleChange} rows={3}
            placeholder="When a user with a null profile visits the dashboard, the service throws an unhandled NullPointerException…"
            className="field resize-y min-h-[80px]"
          />
        </div>

        <div>
          <label htmlFor="issue" className="field-label flex items-center gap-2">
            Issue / error / ask
            <span className="bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded text-[10px] tracking-widest font-bold">REQUIRED</span>
          </label>
          <textarea
            id="issue" name="issue" ref={issueRef} tabIndex={8}
            value={inputs.issue} onChange={handleChange} rows={4} required
            placeholder="E.g. NullPointerException at line 142 when user is null. Need null check and proper 400 response."
            className="field resize-y min-h-[100px]"
          />
        </div>
      </div>

      {/* ── Error banner ──────────────────────────────────────── */}
      {error && (
        <div className="animate-fade-up bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-medium">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" tabIndex={9} disabled={loading || !inputs.issue?.trim()} className="btn-primary">
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          )}
          {loading ? 'Generating…' : 'Generate Prompt'}
        </button>

        <button type="button" tabIndex={10} onClick={onClear} className="btn-ghost">
          Clear
        </button>

        <div className="flex-1" />

        <button type="button" tabIndex={11} onClick={onToggleHistory} className="btn-ghost text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          History
        </button>

        <button type="button" tabIndex={12} onClick={onOpenSettings} className="btn-ghost text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Settings
        </button>
      </div>
    </form>
  );
}
