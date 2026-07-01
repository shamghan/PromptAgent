import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_SYSTEM_PROMPT } from './utils/constants';
import { useLlm } from './hooks/useLlm';
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

function loadTheme() {
  try { return localStorage.getItem(STORAGE_KEYS.THEME) || 'light'; }
  catch { return 'light'; }
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
  
  // Theme state
  const [theme, setTheme] = useState(loadTheme);

  const { generate, loading, error, clearError } = useLlm(systemPrompt);
  const { history, addEntry, deleteEntry, clearHistory } = useHistory();
  const {
    templates, activeTemplateId, setActiveTemplateId, schema, customValues, saveTemplates, handleCustomChange, resetCustomValues, hasSchema, hasTemplates
  } = useCustomForm();

  // Persist form mode preference
  useEffect(() => {
    try { localStorage.setItem('pap_form_mode', formMode); } catch {}
  }, [formMode]);
  
  // Persist and apply theme
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.THEME, theme); } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Switch back to default if custom schema is cleared
  useEffect(() => {
    if (!hasTemplates && formMode === 'custom') setFormMode('default');
  }, [hasTemplates, formMode]);

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

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  return (
    <div className="min-h-screen flex flex-col font-sans dark:bg-slate-900 transition-colors duration-200">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white shadow-btn flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Prompt Agent Portal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Generate AI-ready prompts securely</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="btn-icon bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Form Card */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-glass border border-slate-200/60 dark:border-slate-700 p-6 sm:p-8 animate-fade-up transition-colors duration-200">

          {/* ── Mode toggle & Template Selector ── */}
          {hasTemplates && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-5 border-b border-slate-100 dark:border-slate-700 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 sm:inline sm:mb-0 sm:mr-4">Form mode</span>
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => toggleMode('default')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      formMode === 'default'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
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
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>
              
              {/* Template Selector (only in Custom mode) */}
              {formMode === 'custom' && templates.length > 1 && (
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">Template</span>
                    <select
                      value={activeTemplateId || ''}
                      onChange={(e) => setActiveTemplateId(e.target.value)}
                      className="field !py-1.5 !text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white w-full sm:w-48"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                 </div>
              )}
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
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {/* Output Card */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-glass border border-slate-200/60 dark:border-slate-700 p-6 sm:p-8 animate-fade-up transition-colors duration-200" style={{ animationDelay: '100ms' }}>
          <OutputBox output={output} onRegenerate={handleRegenerate} loading={loading} />
        </section>

        {/* Stats Strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4 px-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          {[
            { label: 'Prompts saved', value: history.length },
            { label: 'Max tokens', value: '1,024' },
            { label: 'Temperature', value: '0.4' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-base font-bold text-slate-800 dark:text-white">{value}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="py-6 text-center bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
        templates={templates}
        onSave={saveTemplates}
        onClose={() => setBuilderOpen(false)}
      />
    </div>
  );
}
