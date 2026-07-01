# Prompt Agent Portal — AGENTS.md

## Quick start

```bash
npm install        # install deps
cp .env.example .env  # then edit VITE_GROQ_API_KEY
npm run dev        # → http://localhost:5173
npm run build      # → dist/
npm run preview    # serve dist/ locally
```

- No tests, no linter, no typechecker, no CI — skip searching for them.
- No backend or database; everything runs client-side.
- No router, no state lib — just React 18 + Tailwind v3.

## API key

- Env var **must** be `VITE_GROQ_API_KEY` (Vite convention — `GROQ_API_KEY` won't work).
- The app checks for the placeholder string `your_groq_api_key_here` and shows a user-facing error.

## Architecture

```
src/
  App.jsx                    — root component, state/UI wiring
  main.jsx                   — React entrypoint
  index.css                  — Tailwind directives + custom component classes
  components/
    PromptForm.jsx           — default input form
    CustomFormBuilderModal.jsx — drag-free field builder (schema → localStorage)
    CustomFormRenderer.jsx   — renders saved custom schema as live form
    OutputBox.jsx            — generated prompt display + copy/regenerate
    HistoryPanel.jsx         — slide-in sidebar (last 10 prompts)
    SettingsModal.jsx        — system prompt editor
  hooks/
    useGroq.js               — Groq API call (fetch only, no SDK)
    useHistory.js            — localStorage read/write for history
    useCustomForm.js         — schema & values state for custom forms
  utils/
    constants.js             — GROQ_CONFIG, DEFAULT_SYSTEM_PROMPT, TASK_TYPES, STORAGE_KEYS
    buildPrompt.js           — assembles system + user messages
```

## Key quirks

- **Form fields are all uncontrolled-to-controlled via `App.jsx` state.** All field keys: `fileName`, `className`, `methodName`, `lineNumber`, `taskName`, `taskType`, `taskDesc`, `issue`.
- **`Issue / ask` field is required** — submit button disabled when empty.
- **Line number** field accepts ranges like `10-25` or `10 - 25` (parsed to `Lines: 10–25`).
- **Model config** lives in `src/utils/constants.js:GROK_CONFIG`. Change `model`, `maxTokens`, or `temperature` there.
- **System prompt** defaults to `DEFAULT_SYSTEM_PROMPT` in constants.js; users can override via Settings modal (stored in localStorage key `pap_system_prompt`; reset restores the code default).
- **Custom form** schema saved to localStorage key `pap_custom_schema`; values reset on page load (schema persists but fields go blank).
- **History** capped at 10 entries; stored in localStorage key `pap_history`.
- **Form mode preference** persisted in localStorage key `pap_form_mode`.
- **Dark mode** Tailwind config has `darkMode: 'class'` and a `STORAGE_KEYS.THEME` key exists, but no dark-mode toggle is wired in the UI.

## localStorage keys (all `pap_` prefix)

| Key | What |
|---|---|
| `pap_history` | Array of {id, timestamp, inputs, output} (max 10) |
| `pap_system_prompt` | Custom system prompt string |
| `pap_form_mode` | `"default"` or `"custom"` |
| `pap_custom_schema` | Array of field definition objects |
| `pap_theme` | Defined but unused in current UI |

## Dev notes

- Vite dev server configured with `open: true` (auto-opens browser).
- Tailwind content paths: `["./index.html", "./src/**/*.{js,jsx}"]`.
- No PostCSS plugins beyond `tailwindcss` + `autoprefixer`.
- Google Fonts (Inter + JetBrains Mono) loaded via `<link>` in `index.html`.
- Favicon is an inline SVG data URI (lightning bolt emoji).
