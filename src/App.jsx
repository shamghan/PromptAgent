import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_SYSTEM_PROMPT } from './utils/constants';
import { useGroq } from './hooks/useGroq';
import { useHistory } from './hooks/useHistory';
import { useCustomForm } from './hooks/useCustomForm';
import { buildCustomUserMessage } from './utils/buildPrompt';
import PromptForm from './components/PromptForm';
import OutputBox from './components/OutputBox';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';
import CustomFormBuilderModal from './components/CustomFormBuilderModal';
import CustomFormRenderer from './components/CustomFormRenderer';

const EMPTY_INPUTS = {
  fileName: '', className: '', methodName: '', lineNumber: '',
  taskName: '', taskType: '', taskDesc: '', issue: '',
};

function loadSystemPrompt() {
  try { return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT; }
  catch { return DEFAULT_SYSTEM_PROMPT; }
}

function loadFormMode() {
  try { return localStorage.getItem('pap_form_mode') || 'default'; }
  catch { return 'default'; }
}

export default function App() {
  const [systemPrompt, setSystemPrompt] = useState(loadSystemPrompt);
  function handleSaveSystemPrompt(v) {
    setSystemPrompt(v);
    try { localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, v); } catch {}
  }

  const [inputs, setInputs] = useState(EMPTY_INPUTS);
  const [output, setOutput] = useState('');
  const [lastInputs, setLastInputs] = useState(null);
  const [lastMode, setLastMode] = useState('default'); // tracks which mode generated last output

  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  // Active form mode: 'default' | 'custom'
  const [formMode, setFormMode] = useState(loadFormMode);

  const { generate, loading, error, clearError } = useGroq(systemPrompt);
  const { history, addEntry, deleteEntry, clearHistory } = useHistory();
  const {
    schema, customValues, saveNewSchema, handleCustomChange, resetCustomValues, hasSchema,
  } = useCustomForm();

  // Persist form mode preference
  useEffect(() => {
    try { localStorage.setItem('pap_form_mode', formMode); } catch {}
  }, [formMode]);

  // Switch back to default if custom schema is cleared
  useEffect(() => {
    if (!hasSchema && formMode === 'custom') setFormMode('default');
  }, [hasSchema, formMode]);

  // ── Generate (default form) ──
  const handleGenerate = useCallback(async (overrideInputs) => {
    const target = overrideInputs || inputs;
    clearError();
    const result = await generate(target);
    if (result) {
      setOutput(result);
      setLastInputs(target);
      setLastMode('default');
      addEntry(target, result);
    }
  }, [inputs, generate, clearError, addEntry]);

  // ── Generate (custom form) ──
  const handleCustomGenerate = useCallback(async () => {
    clearError();
    // Build a synthetic "inputs" object the groq hook can use via custom message
    const userMessage = buildCustomUserMessage(schema, customValues);
    const result = await generate(null, userMessage); // pass raw message
    if (result) {
      setOutput(result);
      setLastInputs({ _custom: true, schema, values: customValues });
      setLastMode('custom');
      addEntry({ _custom: true, schema, values: customValues }, result);
    }
  }, [schema, customValues, generate, clearError, addEntry]);

  // ── Regenerate ──
  const handleRegenerate = useCallback(() => {
    if (!lastInputs) return;
    if (lastMode === 'custom') {
      handleCustomGenerate();
    } else {
      handleGenerate(lastInputs);
    }
  }, [lastInputs, lastMode, handleGenerate, handleCustomGenerate]);

  // ── Clear ──
  const handleClear = useCallback(() => {
    setInputs(EMPTY_INPUTS);
    setOutput('');
    setLastInputs(null);
    clearError();
    resetCustomValues();
  }, [clearError, resetCustomValues]);

  // ── Load from history ──
  const handleLoadHistory = useCallback((entry) => {
    if (entry.inputs?._custom) {
      setFormMode('custom');
    } else {
      setInputs(entry.inputs);
      setFormMode('default');
    }
    setOutput(entry.output);
    setLastInputs(entry.inputs);
    clearError();
  }, [clearError]);

  // ── Toggle mode ──
  function toggleMode(mode) {
    setFormMode(mode);
    clearError();
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white shadow-btn flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Prompt Agent Portal</h1>
              <p className="text-xs text-slate-500 font-medium">Generate AI-ready prompts securely</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Form Card */}
        <section className="bg-white rounded-2xl shadow-glass border border-slate-200/60 p-6 sm:p-8 animate-fade-up">

          {/* ── Mode toggle (only shown when a custom schema exists) ── */}
          {hasSchema && (
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Form mode</span>
              <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => toggleMode('default')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    formMode === 'default'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => toggleMode('custom')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    formMode === 'custom'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
          )}

          {formMode === 'custom' && hasSchema ? (
            <CustomFormRenderer
              schema={schema}
              values={customValues}
              onChange={handleCustomChange}
              onSubmit={handleCustomGenerate}
              onClear={handleClear}
              onToggleHistory={() => setHistoryOpen(o => !o)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenBuilder={() => setBuilderOpen(true)}
              loading={loading}
              error={error}
            />
          ) : (
            <PromptForm
              inputs={inputs} setInputs={setInputs}
              onSubmit={handleGenerate} onClear={handleClear}
              onToggleHistory={() => setHistoryOpen(o => !o)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenBuilder={() => setBuilderOpen(true)}
              loading={loading} error={error}
            />
          )}
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Output Card */}
        <section className="bg-white rounded-2xl shadow-glass border border-slate-200/60 p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <OutputBox output={output} onRegenerate={handleRegenerate} loading={loading} />
        </section>

        {/* Stats Strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4 px-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          {[
            { label: 'Prompts saved', value: history.length },
            { label: 'Max tokens', value: '1,024' },
            { label: 'Temperature', value: '0.4' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-base font-bold text-slate-800">{value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="py-6 text-center bg-white border-t border-slate-200">
        <p className="text-sm font-medium text-slate-500">
          Prompt Agent Portal · Built for developers
        </p>
      </footer>

      <HistoryPanel
        isOpen={historyOpen} history={history}
        onLoad={handleLoadHistory} onDelete={deleteEntry}
        onClearAll={clearHistory} onClose={() => setHistoryOpen(false)}
      />
      <SettingsModal
        isOpen={settingsOpen} systemPrompt={systemPrompt}
        onSave={handleSaveSystemPrompt} onClose={() => setSettingsOpen(false)}
      />
      <CustomFormBuilderModal
        isOpen={builderOpen}
        schema={schema}
        onSave={saveNewSchema}
        onClose={() => setBuilderOpen(false)}
      />
    </div>
  );
}
