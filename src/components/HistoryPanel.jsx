import { useEffect, useRef } from 'react';

function formatTimestamp(iso) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today · ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday · ${timeStr}`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + timeStr;
}

function cardTitle(inputs) {
  const parts = [inputs.fileName, inputs.taskName].filter(Boolean).join(' · ');
  return parts ? parts.slice(0, 42) : 'Untitled prompt';
}

function typeColor(taskType) {
  const map = {
    'Bug fix': 'bg-red-50 text-red-600 border-red-200',
    Feature: 'bg-brand-50 text-brand-600 border-brand-200',
    Refactor: 'bg-amber-50 text-amber-600 border-amber-200',
    'Code review': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    Performance: 'bg-violet-50 text-violet-600 border-violet-200',
    'Unit test': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };
  return map[taskType] || 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function HistoryPanel({ history, onLoad, onDelete, onClearAll, onClose, isOpen }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Slide panel */}
      <aside
        ref={panelRef}
        className="relative z-50 flex flex-col w-full max-w-sm h-full bg-white border-l border-slate-200 shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">History</h2>
              <p className="text-xs text-slate-500 font-medium">{history.length} of 10 saved</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs px-2.5 py-1.5 rounded-md font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} className="btn-icon">
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
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No history yet</p>
              <p className="text-xs mt-1 text-slate-500">Generated prompts will appear here</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="group bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {formatTimestamp(entry.timestamp)}
                  </p>
                  {entry.inputs.taskType && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${typeColor(entry.inputs.taskType)}`}
                    >
                      {entry.inputs.taskType}
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-800 truncate mb-1">
                  {cardTitle(entry.inputs)}
                </p>
                <p className="text-[13px] leading-relaxed text-slate-500 mb-4 line-clamp-2">
                  {entry.output?.slice(0, 90)}…
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onLoad(entry);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                  >
                    Load Prompt
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
