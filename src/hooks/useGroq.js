/**
 * useGroq.js
 * Custom hook that handles all Groq API communication.
 * Returns { generate, loading, error, clearError }
 */

import { useState, useCallback } from 'react';
import { GROQ_CONFIG } from '../utils/constants';
import { buildPromptPayload } from '../utils/buildPrompt';

export function useGroq(systemPrompt) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Calls the Groq API and returns the generated prompt string.
   * @param {Object|null} inputs        - Form field values (default form)
   * @param {string|null} rawUserMessage - Pre-built message (custom form)
   * @returns {Promise<string|null>} The generated prompt or null on error
   */
  const generate = useCallback(async (inputs, rawUserMessage = null) => {
    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      setError('No API key found. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.');
      setLoading(false);
      return null;
    }

    const sys = systemPrompt;
    const userMessage = rawUserMessage ?? buildPromptPayload(systemPrompt, inputs).userMessage;

    const requestBody = {
      model:       GROQ_CONFIG.model,
      max_tokens:  GROQ_CONFIG.maxTokens,
      temperature: GROQ_CONFIG.temperature,
      messages: [
        { role: 'system', content: sys },
        { role: 'user',   content: userMessage },
      ],
    };

    try {
      const response = await fetch(GROQ_CONFIG.endpoint, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid API key. Check your .env file and make sure VITE_GROQ_API_KEY is correct.');
        } else if (response.status === 429) {
          setError('Rate limit hit. Wait a moment and try again.');
        } else {
          const errData = await response.json().catch(() => ({}));
          setError(`API error ${response.status}: ${errData?.error?.message || response.statusText}`);
        }
        setLoading(false);
        return null;
      }

      const data = await response.json();
      const result = data?.choices?.[0]?.message?.content?.trim();

      if (!result) {
        setError('Received an empty response from the API. Please try again.');
        setLoading(false);
        return null;
      }

      setLoading(false);
      return result;
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot reach Groq API. Check your internet connection.');
      } else {
        setError(`Unexpected error: ${err.message}`);
      }
      setLoading(false);
      return null;
    }
  }, [systemPrompt]);

  return { generate, loading, error, clearError };
}
