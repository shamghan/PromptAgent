import DEFAULT_SYSTEM_PROMPT_TEXT from './system_prompt.txt?raw';

// ─── Default system prompt ────────────────────────────────────────────────────
export const DEFAULT_SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT_TEXT;

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
  { value: 'openai/gpt-oss-120b', label: 'GPT OSS 120B (Groq)' },
  { value: 'codestral-latest', label: 'Codestral (Mistral)' },
  { value: 'gemma-4-31b-it', label: 'Gemma 4 31B (Gemini)' },
  { value: 'mistral-large-latest', label: 'Mistral Large (Mistral)' },
  { value: 'openrouter/deepseek/deepseek-chat', label: 'DeepSeek V3 (OpenRouter)' },
  { value: 'openrouter/deepseek/deepseek-r1', label: 'DeepSeek R1 (OpenRouter)' },
  { value: 'openrouter/moonshotai/kimi-k3', label: 'Kimi K3 (OpenRouter)' },
];

// ─── API config ───────────────────────────────────────────────────────────────
export const GROQ_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'openai/gpt-oss-120b', // Default fallback
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

export const OPENROUTER_CONFIG = {
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
};

// ─── History ──────────────────────────────────────────────────────────────────
export const MAX_HISTORY = 10;
