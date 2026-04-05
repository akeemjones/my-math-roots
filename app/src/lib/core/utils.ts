/**
 * Shared utilities for the My Math Roots app.
 */

/**
 * Detect whether a string contains actual HTML tags (not just `<` in math expressions).
 * Used to decide between `{@html text}` and plain text rendering.
 */
export function hasHtmlTags(text: string | undefined | null): boolean {
  return !!text && /<[a-z][\s\S]*>/i.test(text);
}
