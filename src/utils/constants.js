// ─── Default system prompt ────────────────────────────────────────────────────
export const DEFAULT_SYSTEM_PROMPT = `You are an expert at writing developer prompts for AI coding assistants.

Your job: take raw coding context from a developer and transform it into a single, high-quality prompt they can paste into Claude and get an expert answer immediately.

Rules:
- Output ONLY the final prompt. No intro, no explanation, no "Here is your prompt:".
- Open with one sentence that sets the role: what codebase, language, or domain Claude is working in.
- State the exact location in code (file, class, method, line) so Claude knows precisely where to focus.
- If a task ID or description is given, summarise the intent in one line — what business goal is being solved.
- State the problem or ask sharply. No vague language. If there is an error, include it exactly.
- Close with a concrete instruction: what Claude must produce — fixed code, explanation, test, review, etc.
- Use present tense. Be direct. Write like a senior developer briefing a colleague.
- Skip missing fields cleanly — do not write "not provided" or leave blank placeholders.`;

// ─── Task type options ────────────────────────────────────────────────────────
export const TASK_TYPES = [
  { value: '', label: 'Select type…' },
  { value: 'Bug fix', label: 'Bug fix' },
  { value: 'Feature', label: 'Feature' },
  { value: 'Refactor', label: 'Refactor' },
  { value: 'Code review', label: 'Code review' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Unit test', label: 'Unit test' },
];

// ─── localStorage keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  HISTORY: 'pap_history',
  SYSTEM_PROMPT: 'pap_system_prompt',
  THEME: 'pap_theme',
};

// ─── API config ───────────────────────────────────────────────────────────────
export const GROQ_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.3-70b-versatile',
  maxTokens: 1024,
  temperature: 0.4,
};

// ─── History ──────────────────────────────────────────────────────────────────
export const MAX_HISTORY = 10;
