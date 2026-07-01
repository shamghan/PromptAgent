// ─── Default system prompt ────────────────────────────────────────────────────
export const DEFAULT_SYSTEM_PROMPT = `You are an expert at writing developer prompts for AI coding assistants.

Your job: take raw coding context from a developer and transform it into a single, high-quality prompt they can paste into any AI assistant and get an expert answer immediately.

Rules:
- Output ONLY the final prompt. No intro, no explanation, no "Here is your prompt:".
- Open with one sentence that sets the role: what codebase, language, or domain the assistant is working in — but ONLY if a file name or class name was provided. Never infer the codebase or domain from the method name, line number, or any other field.
- State the exact location in code (file, class, method, line) so the assistant knows precisely where to focus.
- If a task ID or description is given, summarise the intent in one line — what business goal is being solved.
- State the problem or ask sharply. No vague language. If there is an error, include it exactly.
- Close with a concrete instruction: what the assistant must produce — fixed code, explanation, test, review, etc.
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
  CUSTOM_SCHEMA: 'pap_custom_schema',
  SELECTED_MODEL: 'pap_selected_model',
};

export const AVAILABLE_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)' },
  { value: 'gemma-4-26b-a4b-it', label: 'Gemma 4 26B (Google)' },
  { value: 'mistral-large-latest', label: 'Mistral Large (Mistral AI)' },
];

// ─── API config ───────────────────────────────────────────────────────────────
export const GROQ_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.3-70b-versatile', // Default fallback
  maxTokens: 1024,
  temperature: 0.4,
};

export const GEMINI_CONFIG = {
  endpointBase: 'https://generativelanguage.googleapis.com/v1beta/models/',
  // Appended per request: `${model}:generateContent?key=${API_KEY}`
};

export const MISTRAL_CONFIG = {
  endpoint: 'https://api.mistral.ai/v1/chat/completions',
};

// ─── History ──────────────────────────────────────────────────────────────────
export const MAX_HISTORY = 10;
