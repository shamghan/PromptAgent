import { useEffect, useState } from 'react';
import {
  DEFAULT_SYSTEM_PROMPT,
  AVAILABLE_MODELS,
  STORAGE_KEYS,
  GROQ_CONFIG,
} from '../utils/constants';

export default function SettingsModal({ systemPrompt, onSave, onClose, isOpen }) {
  const [draft, setDraft] = useState(systemPrompt);
  const [changed, setChanged] = useState(false);

  // Model state
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || GROQ_CONFIG.model;
    } catch {
      return GROQ_CONFIG.model;
    }
  });
  const [modelChanged, setModelChanged] = useState(false);

  useEffect(() => {
    setDraft(systemPrompt);
    setChanged(false);
  }, [systemPrompt]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  function handleDraftChange(e) {
    setDraft(e.target.value);
    setChanged(e.target.value !== systemPrompt);
  }

  function handleModelChange(e) {
    setSelectedModel(e.target.value);
    const currentSaved = (() => {
      try {
        return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || GROQ_CONFIG.model;
      } catch {
        return GROQ_CONFIG.model;
      }
    })();
    setModelChanged(e.target.value !== currentSaved);
  }

  function handleSave() {
    onSave(draft.trim() || DEFAULT_SYSTEM_PROMPT);
    if (modelChanged) {
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModel);
      } catch {}
      // We force reload to apply model change cleanly across the app, or we can just let useGroq read from localstorage on next click.
      // Better to dispatch a custom event or just let it be read on generate. useGroq will read it.
      setModelChanged(false);
    }
    onClose();
  }

  function handleReset() {
    setDraft(DEFAULT_SYSTEM_PROMPT);
    setChanged(DEFAULT_SYSTEM_PROMPT !== systemPrompt);
    setSelectedModel(GROQ_CONFIG.model);
    setModelChanged(
      GROQ_CONFIG.model !==
        (() => {
          try {
            return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || GROQ_CONFIG.model;
          } catch {
            return GROQ_CONFIG.model;
          }
        })(),
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-float overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Settings</h2>
              <p className="text-xs font-medium text-slate-500">Customise the AI system prompt</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon bg-slate-50">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-slate-50/50 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="field-label mb-2 block">AI Model</label>
            <div className="relative">
              <select
                className="field appearance-none pr-10 cursor-pointer"
                value={selectedModel}
                onChange={handleModelChange}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="field-label mb-2 block">System Prompt</label>
            <div className="mb-4 text-sm text-slate-600 bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
              <svg
                className="w-5 h-5 text-brand-500 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p>
                This instruction is sent to the AI <strong>before</strong> your developer context.
                It controls the style and quality of the output. Edits are saved locally in your
                browser.
              </p>
            </div>

            <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-mono font-medium text-slate-500">
                  system_prompt.txt{changed && <span className="text-brand-500"> *</span>}
                </span>
              </div>
              <textarea
                value={draft}
                onChange={handleDraftChange}
                rows={12}
                className="w-full p-4 text-[13px] leading-relaxed text-slate-700 bg-transparent resize-y focus:outline-none font-mono min-h-[200px]"
              />
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-xs font-mono text-slate-400 font-medium">
                {draft.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleReset}
            className="text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            Reset to default
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              {changed || modelChanged ? 'Save changes' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
