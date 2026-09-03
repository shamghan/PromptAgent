import { useEffect, useRef, useState } from 'react';
import { extractOrGenerateGitSuggestions } from '../utils/gitSuggestions';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-fade-up">
      <div className="relative mb-5">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float flex items-center justify-center">
          <svg
            className="w-8 h-8 text-brand-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Ready to generate</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        Fill in at least the{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">Issue / ask</span> field
        and click{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">Generate Prompt</span>.
      </p>
      <div className="flex flex-wrap justify-center gap-1.5 mt-5">
        {['Bug fix', 'Feature', 'Code review', 'Unit test'].map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function OutputBox({ output, onRegenerate, loading, inputs }) {
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (output && boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [output]);

  // Clean prompt text by removing trailing markdown headers or separators if included in LLM output
  const cleanPrompt = (() => {
    if (!output) return '';
    let text = output;

    // Split on explicit separator or Git section if present
    if (text.includes('---')) {
      text = text.split('---')[0];
    }
    if (/###\s*Suggested\s*Git/i.test(text)) {
      text = text.split(/###\s*Suggested\s*Git/i)[0];
    }

    // Remove any trailing markdown headings or isolated hash lines
    text = text.replace(/(\r?\n)*\s*(###\s*.*|#\s*)$/gi, '');

    return text.trim();
  })();

  const { branches, commits } = output
    ? extractOrGenerateGitSuggestions(output, inputs || {})
    : { branches: [], commits: [] };

  async function handleCopyMain() {
    if (!cleanPrompt) return;
    try {
      await navigator.clipboard.writeText(cleanPrompt);
    } catch {
      if (textRef.current) {
        textRef.current.select();
        document.execCommand('copy');
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyItem(text, id) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  }

  return (
    <div ref={boxRef} className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2 h-2 rounded-full ${output ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
            Generated Prompt
          </span>
        </div>
        {output && (
          <div className="flex items-center gap-2 animate-fade-in">
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="btn-ghost !py-1.5 !px-3 !text-xs"
            >
              {loading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Regenerate
            </button>
            <button
              onClick={handleCopyMain}
              className={`btn-primary !py-1.5 !px-3 !text-xs ${copied ? '!bg-emerald-500 !shadow-none' : ''}`}
            >
              {copied ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Output container */}
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-300 ${output ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl shadow-slate-900/20 border border-slate-700/50' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed'}`}
      >
        {output && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/40">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="ml-2 text-xs font-mono text-slate-500">prompt.txt</span>
          </div>
        )}
        {output ? (
          <textarea
            ref={textRef}
            readOnly
            value={cleanPrompt}
            rows={12}
            className="w-full bg-transparent p-5 text-[13px] leading-relaxed text-slate-200 focus:outline-none font-mono resize-none selection:bg-brand-500/30"
            spellCheck={false}
          />
        ) : (
          <EmptyState />
        )}
        {output && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 border-t border-slate-700/40">
            <span className="text-xs font-mono text-slate-500">
              {cleanPrompt.length.toLocaleString()} chars
            </span>
            <span className="text-xs font-mono text-slate-600">output</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="flex gap-1 mb-3">
              <div
                className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-brand-300 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Writing prompt…
            </p>
          </div>
        )}
      </div>

      {/* Git Suggestions Section */}
      {output && !loading && (branches.length > 0 || commits.length > 0) && (
        <div className="flex flex-col gap-5 pt-2 animate-fade-up">
          {/* Branch suggestions */}
          {branches.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Suggested Git Branches
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {branches.map((branch, idx) => {
                  const itemId = `branch-${idx}`;
                  const isCopied = copiedItem === itemId;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:border-slate-600/70 transition-colors"
                    >
                      <code className="text-xs font-mono text-emerald-400 break-all select-all">
                        {branch}
                      </code>
                      <button
                        onClick={() => handleCopyItem(branch, itemId)}
                        className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                        }`}
                        title="Copy branch name"
                      >
                        {isCopied ? (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Commit suggestions */}
          {commits.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Suggested Git Commit Messages
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {commits.map((commitMsg, idx) => {
                  const itemId = `commit-${idx}`;
                  const isCopied = copiedItem === itemId;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:border-slate-600/70 transition-colors"
                    >
                      <code className="text-xs font-mono text-sky-300 break-all select-all">
                        {commitMsg}
                      </code>
                      <button
                        onClick={() => handleCopyItem(commitMsg, itemId)}
                        className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                        }`}
                        title="Copy commit message"
                      >
                        {isCopied ? (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
