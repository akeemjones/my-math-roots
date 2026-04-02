/**
 * Gemini hint service — AI-powered hints via the Netlify function.
 *
 * The actual endpoint is /.netlify/functions/gemini-hint (already deployed
 * in the vanilla app). This service just wraps the fetch call and keeps
 * the UI wired to a loading state.
 *
 * Phase 5: fetch is stubbed to avoid double-billing the existing endpoint
 * during development. Replace STUB_MODE = false once the SvelteKit app
 * reaches feature parity in Phase 8.
 */

const STUB_MODE = true;

export interface HintResult {
  hint: string | null;
  error: string | null;
}

/**
 * Fetch an AI hint for the given question + wrong answer.
 * Returns { hint, error } — one will always be null.
 */
export async function getGeminiHint(
  questionText: string,
  wrongAnswer: string
): Promise<HintResult> {
  if (STUB_MODE) {
    // Simulate a short network delay so the "Thinking…" indicator is visible
    await new Promise((r) => setTimeout(r, 900));
    return {
      hint: `Try re-reading the question carefully. Think about what operation is being asked for, then check if ${wrongAnswer} makes sense as an answer.`,
      error: null,
    };
  }

  try {
    const res = await fetch('/.netlify/functions/gemini-hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: questionText, wrongAnswer }),
    });
    if (!res.ok) {
      return { hint: null, error: `Server error ${res.status}` };
    }
    const data = await res.json();
    return { hint: data.hint ?? null, error: data.error ?? null };
  } catch (err) {
    return { hint: null, error: 'Could not reach the hint service. Check your connection.' };
  }
}
