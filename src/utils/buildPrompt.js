/**
 * buildPrompt.js
 * Assembles the system prompt and the user message sent to the Groq API.
 * Only includes lines where the input field has a non-empty value.
 */

/**
 * Builds the user message from the form fields.
 * @param {Object} inputs - All form field values
 * @returns {string} Formatted user message
 */
export function buildUserMessage(inputs) {
  const { fileName, className, methodName, lineNumber, taskName, taskType, taskDesc, issue } = inputs;

  const lines = ['Convert this developer context into one optimised AI prompt:\n'];

  if (fileName?.trim())   lines.push(`File:   ${fileName.trim()}`);
  if (className?.trim())  lines.push(`Class:  ${className.trim()}`);
  if (methodName?.trim()) lines.push(`Method: ${methodName.trim()}`);
  if (lineNumber?.toString().trim()) {
    const ln = lineNumber.toString().trim();
    // Detect range patterns like "10-25" or "10 - 25"
    const rangeMatch = ln.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (rangeMatch) {
      lines.push(`Lines:  ${rangeMatch[1]}–${rangeMatch[2]}`);
    } else {
      lines.push(`Line:   ${ln}`);
    }
  }

  const cleanTaskName = taskName?.trim();
  const cleanTaskType = taskType?.trim();
  if (cleanTaskName) {
    const taskLine = cleanTaskType
      ? `Task:   ${cleanTaskName} (${cleanTaskType})`
      : `Task:   ${cleanTaskName}`;
    lines.push(taskLine);
  } else if (cleanTaskType) {
    lines.push(`Task:   ${cleanTaskType}`);
  }

  if (taskDesc?.trim()) lines.push(`Desc:   ${taskDesc.trim()}`);
  if (issue?.trim())    lines.push(`Issue:  ${issue.trim()}`);

  return lines.join('\n');
}

/**
 * Builds the complete messages array for the Groq API.
 * @param {string} systemPrompt - The (possibly customised) system prompt
 * @param {Object} inputs       - All form field values
 * @returns {{ systemPrompt: string, userMessage: string }}
 */
export function buildPromptPayload(systemPrompt, inputs) {
  const userMessage = buildUserMessage(inputs);
  return { systemPrompt, userMessage };
}

/**
 * Builds the user message from a custom schema + custom values.
 * Only includes fields where the value is non-empty.
 * @param {Array}  schema - Array of field definition objects
 * @param {Object} values - Map of fieldId → value
 * @returns {string} Formatted user message
 */
export function buildCustomUserMessage(schema, values) {
  const lines = ['Convert this developer context into one optimised AI prompt:\n'];

  for (const field of schema) {
    const val = values[field.id];
    if (val === undefined || val === null) continue;
    const trimmed = String(val).trim();
    if (!trimmed) continue;
    // Pad label to align values (max 10 chars)
    const pad = field.label.length < 10 ? ' '.repeat(10 - field.label.length) : '';
    lines.push(`${field.label}:${pad}${trimmed}`);
  }

  return lines.join('\n');
}

