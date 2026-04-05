/**
 * Supabase client singleton.
 *
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from the environment.
 * Falls back to empty strings so the build succeeds even if the .env file
 * is not configured yet — all Supabase calls will fail gracefully at runtime.
 *
 * Add to app/.env (never commit this file):
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<your-anon-key>
 */

import { createClient } from '@supabase/supabase-js';

// Fall back to a placeholder so createClient doesn't throw before .env is configured.
// All network calls will fail gracefully until real values are set.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
