import { useEffect, useRef, useState } from 'react';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center select-none animate-fade-up">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl shadow-float flex items-center justify-center animate-float">
          <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to generate</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        Fill in at least the <span className="font-semibold text-slate-700">Issue / ask</span> field and click <span className="font-semibold text-slate-700">Generate Prompt</span>.
      </p>

      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {['Bug fix', 'Feature', 'Code review', 'Unit test'].map((tag) => (
          <span key={tag} className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function OutputBox({ output, onRegenerate, loading }) {
  const [copied, setCopied] = useState(false);
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (output && boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [output]);

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      if (textRef.current) { textRef.current.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div ref={boxRef} className="flex flex-col gap-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${output ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Generated Prompt
          </span>
        </div>

        {output && (
          <div className="flex items-center gap-2 animate-fade-in">
            <button onClick={onRegenerate} disabled={loading} className="btn-ghost !py-1.5 !px-3 !text-xs !bg-white">
              {loading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              )}
              Regenerate
            </button>

            <button onClick={handleCopy} className={`btn-primary !py-1.5 !px-3 !text-xs ${copied ? '!bg-emerald-500 !shadow-none' : ''}`}>
              {copied ? (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg> Copied</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Output container ──────────────────────────────────── */}
      <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${output ? 'bg-slate-900 shadow-xl shadow-slate-900/10' : 'bg-slate-50 border border-slate-200 border-dashed'}`}>
        
        {output && (
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
            </div>
            <span className="ml-2 text-xs font-mono text-slate-400">prompt.txt</span>
          </div>
        )}

        {output ? (
          <textarea
            ref={textRef} readOnly value={output} rows={12}
            className="w-full bg-transparent p-5 text-[13px] leading-relaxed text-slate-300 focus:outline-none font-mono resize-none"
          />
        ) : (
          <EmptyState />
        )}

        {output && (
          <div className="flex items-center justify-end px-4 py-2 bg-slate-800/50 border-t border-slate-700/50">
            <span className="text-xs font-mono text-slate-400">{output.length.toLocaleString()} chars</span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <svg className="w-8 h-8 text-brand-600 animate-spin mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <p className="text-sm font-semibold text-slate-800">Writing prompt...</p>
          </div>
        )}
      </div>
    </div>
  );
}
