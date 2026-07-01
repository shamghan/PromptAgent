/**
 * useLlm.js
 * Custom hook that handles communication with both Groq and Gemini APIs.
 * Routes the request to the correct provider based on the selected model name.
 */

import { useState, useCallback } from 'react';
import { GROQ_CONFIG, GEMINI_CONFIG, MISTRAL_CONFIG, STORAGE_KEYS } from '../utils/constants';
import { buildPromptPayload } from '../utils/buildPrompt';

export function useLlm(systemPrompt) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const generate = useCallback(
    async (inputs, rawUserMessage = null) => {
      setLoading(true);
      setError(null);

      const activeModel = (() => {
        try {
          return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || GROQ_CONFIG.model;
        } catch {
          return GROQ_CONFIG.model;
        }
      })();

      const isGemini = activeModel.startsWith('gemini');
      const isGemma = activeModel.startsWith('gemma');
      const usesGeminiApi = isGemini || isGemma;
      const isMistral = activeModel.startsWith('mistral');

      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      const geminiKey = isGemma
        ? import.meta.env.VITE_GEMINI2_API_KEY
        : import.meta.env.VITE_GEMINI_API_KEY;
      const mistralKey = import.meta.env.VITE_MISTRAL_API_KEY;

      if (!usesGeminiApi && !isMistral && (!groqKey || groqKey === 'your_groq_api_key_here')) {
        setError(
          'No Groq API key found. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.',
        );
        setLoading(false);
        return null;
      }

      if (
        usesGeminiApi &&
        (!geminiKey ||
          geminiKey === 'your_gemini_api_key_here' ||
          geminiKey === 'your_gemini2_api_key_here')
      ) {
        setError(
          'No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.',
        );
        setLoading(false);
        return null;
      }

      if (isMistral && (!mistralKey || mistralKey === 'your_mistral_api_key_here')) {
        setError(
          'No Mistral API key found. Add VITE_MISTRAL_API_KEY to your .env file and restart the dev server.',
        );
        setLoading(false);
        return null;
      }

      const sys = systemPrompt;
      const userMessage = rawUserMessage ?? buildPromptPayload(systemPrompt, inputs).userMessage;

      try {
        let result = null;

        if (isMistral) {
          // --- MISTRAL API CALL (OpenAI-compatible) ---
          const requestBody = {
            model: activeModel,
            max_tokens: GROQ_CONFIG.maxTokens,
            temperature: GROQ_CONFIG.temperature,
            messages: [
              { role: 'system', content: sys },
              { role: 'user', content: userMessage },
            ],
          };

          const response = await fetch(MISTRAL_CONFIG.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${mistralKey}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            if (response.status === 401) {
              setError('Invalid Mistral API key. Check your .env file.');
            } else if (response.status === 429) {
              setError('Mistral rate limit hit. Wait a moment and try again.');
            } else {
              const errData = await response.json().catch(() => ({}));
              setError(
                `Mistral API error ${response.status}: ${errData?.error?.message || response.statusText}`,
              );
            }
            setLoading(false);
            return null;
          }

          const data = await response.json();
          result = data?.choices?.[0]?.message?.content?.trim();
        } else if (usesGeminiApi) {
          // --- GEMINI API CALL ---
          const url = `${GEMINI_CONFIG.endpointBase}${activeModel}:generateContent?key=${geminiKey}`;

          // Gemini expects system instructions in a separate field if supported,
          // but the easiest robust way is to combine them or use system_instruction object.
          // For standard Gemini API:
          const requestBody = {
            system_instruction: {
              parts: [{ text: sys }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userMessage }],
              },
            ],
            generationConfig: {
              temperature: GROQ_CONFIG.temperature,
              maxOutputTokens: GROQ_CONFIG.maxTokens,
            },
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            setError(
              `Gemini API error ${response.status}: ${errData?.error?.message || response.statusText}`,
            );
            setLoading(false);
            return null;
          }

          const data = await response.json();
          result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        } else {
          // --- GROQ API CALL ---
          const requestBody = {
            model: activeModel,
            max_tokens: GROQ_CONFIG.maxTokens,
            temperature: GROQ_CONFIG.temperature,
            messages: [
              { role: 'system', content: sys },
              { role: 'user', content: userMessage },
            ],
          };

          const response = await fetch(GROQ_CONFIG.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            if (response.status === 401) {
              setError(
                'Invalid API key. Check your .env file and make sure VITE_GROQ_API_KEY is correct.',
              );
            } else if (response.status === 429) {
              setError('Rate limit hit. Wait a moment and try again.');
            } else {
              const errData = await response.json().catch(() => ({}));
              setError(
                `Groq API error ${response.status}: ${errData?.error?.message || response.statusText}`,
              );
            }
            setLoading(false);
            return null;
          }

          const data = await response.json();
          result = data?.choices?.[0]?.message?.content?.trim();
        }

        if (!result) {
          setError('Received an empty response from the API. Please try again.');
          setLoading(false);
          return null;
        }

        setLoading(false);
        return result;
      } catch (err) {
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Cannot reach the API. Check your internet connection.');
        } else {
          setError(`Unexpected error: ${err.message}`);
        }
        setLoading(false);
        return null;
      }
    },
    [systemPrompt],
  );

  return { generate, loading, error, clearError };
}
