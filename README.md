# ⚡ Prompt Agent Portal

A developer tool that takes structured coding context as input and generates an optimised, Claude-ready prompt using the **Groq API** (llama-3.3-70b-versatile).

Built with React 18 + Vite + Tailwind CSS v3. Runs entirely in the browser — no backend, no database.

---

## What it does

1. You fill in structured context about your code: file, class, method, line number, Azure DevOps task, description, and the problem/ask.
2. The app sends that context to Groq's LLM with a carefully crafted system prompt.
3. The model returns a single, sharp, Claude-ready prompt you can paste directly into Claude.
4. Your last 10 generated prompts are saved in browser localStorage for quick reuse.

---

## Setup

### 1. Clone / download the project

```bash
git clone <your-repo-url>
cd prompt-agent-portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Groq API key

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and replace the placeholder:

```env
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Get a free key at [console.groq.com](https://console.groq.com).

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## How to change the model

Open `src/utils/constants.js` and edit the `GROQ_CONFIG` object:

```js
export const GROQ_CONFIG = {
  endpoint:    'https://api.groq.com/openai/v1/chat/completions',
  model:       'llama-3.3-70b-versatile',   // ← change this
  maxTokens:   1024,
  temperature: 0.4,
};
```

Available Groq models: `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `gemma2-9b-it`.

---

## How to edit the system prompt

### Via the UI (recommended)

1. Click the **Settings** button in the form.
2. Edit the system prompt in the textarea.
3. Click **Save** — stored in `localStorage` key `pap_system_prompt`.
4. Click **Reset to default** to restore the original.

### Via code

Edit the `DEFAULT_SYSTEM_PROMPT` constant in `src/utils/constants.js`.

---

## Project structure

```
src/
  components/
    PromptForm.jsx      — all input fields + action buttons
    OutputBox.jsx       — generated prompt display + copy/regenerate
    HistoryPanel.jsx    — slide-in sidebar with last 10 prompts
    SettingsModal.jsx   — system prompt editor
  hooks/
    useGroq.js          — Groq API call logic
    useHistory.js       — localStorage read/write
  utils/
    buildPrompt.js      — assembles system + user messages
    constants.js        — default system prompt, task types, config
  App.jsx
  main.jsx
  index.css
```

---

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## License

MIT
