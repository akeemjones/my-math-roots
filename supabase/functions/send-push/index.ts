import { createClient } from 'npm:@supabase/supabase-js@2';
import webPush from 'npm:web-push';

// ── Service-key resolver ──────────────────────────────────────────────────
// Prefers the new SUPABASE_SECRET_KEYS (JSON array, auto-injected by the
// Supabase Edge Functions runtime alongside the deprecated
// SUPABASE_SERVICE_ROLE_KEY). Falls back to the legacy var so this code
// is safe to deploy BEFORE the dashboard "Disable legacy keys" step.
// Throws if neither source resolves. The error message never includes
// secret values; nothing is logged from this function.
//
// envGet is parameterized so this helper can be unit-tested without the
// Deno runtime (see tests/send-push-key-resolver.test.js).
function _resolveSupabaseServiceKey(envGet: (name: string) => string | undefined): string {
  const secretKeysRaw = envGet('SUPABASE_SECRET_KEYS');
  if (secretKeysRaw) {
    try {
      const parsed = JSON.parse(secretKeysRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (first && typeof first === 'object') {
          const candidate = first.key || first.api_key;
          if (typeof candidate === 'string' && candidate.length > 0) {
            return candidate;
          }
        }
      }
    } catch {
      // Malformed SUPABASE_SECRET_KEYS — fall through to legacy fallback.
      // Intentionally swallowed; do not log (the source might contain
      // partial secret material).
    }
  }
  const legacy = envGet('SUPABASE_SERVICE_ROLE_KEY');
  if (typeof legacy === 'string' && legacy.length > 0) {
    return legacy;
  }
  throw new Error('Neither SUPABASE_SECRET_KEYS nor SUPABASE_SERVICE_ROLE_KEY is set');
}

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = _resolveSupabaseServiceKey((n) => Deno.env.get(n));
const SEND_PUSH_SECRET    = Deno.env.get('SEND_PUSH_SECRET');
const VAPID_PUBLIC_KEY    = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY   = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT       = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@mymathroots.com';

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// ── Message catalogue ─────────────────────────────────────────────────────────
const DAILY_MESSAGES = [
  { title: '🌱 Math time!',            body: "Your sprout is waiting. Do a lesson today!" },
  { title: '📚 Keep growing!',          body: "Just a few minutes of math makes a big difference." },
  { title: '🎯 Challenge yourself!',    body: "Ready for a quiz? Pick up where you left off." },
  { title: '🌟 Practice makes perfect!',body: "A short lesson today keeps the rust away!" },
];

const STREAK_WARNING = {
  title: '⚡ Don\'t break your streak!',
  body:  "Do a lesson today to keep your streak alive!",
};

const STREAK_5_DAY = {
  title: '🔥 5-Day Streak!',
  body:  "Amazing — 5 days in a row! Keep that momentum going!",
};

// ── Handler ───────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Require an exact shared-secret Authorization header. The previous
  // implementation accepted either `Bearer ${SERVICE_ROLE_KEY}` OR the
  // header `x-supabase-cron: true`. The cron header is client-settable —
  // anyone with the function URL could POST that header and trigger
  // push notifications to every subscriber, burning WebPush + admin
  // attention. Replaced with a dedicated SEND_PUSH_SECRET so the secret
  // can be rotated independently of the service-role key.
  if (!SEND_PUSH_SECRET) {
    return new Response('Server misconfigured', { status: 500 });
  }
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${SEND_PUSH_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Today / yesterday in UTC YYYY-MM-DD
  const now       = new Date();
  const today     = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);

  // Fetch push subscriptions in pages of 1000. With a small subscriber
  // count this loop iterates once; defense-in-depth for future growth.
  type Sub = { id: string; endpoint: string; p256dh: string; auth: string; user_id: string | null };
  const PAGE_SIZE = 1000;
  const subs: Sub[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supa
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id')
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    if (!data || data.length === 0) break;
    subs.push(...(data as Sub[]));
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  if (subs.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  // Bulk-fetch streak profiles for every subscriber who has an account
  const userIds = [...new Set(subs.map(s => s.user_id).filter(Boolean))] as string[];
  const profileMap: Record<string, { current_streak: number; last_activity_date: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supa
      .from('profiles')
      .select('id, current_streak, last_activity_date')
      .in('id', userIds);
    if (profiles) {
      for (const p of profiles) profileMap[p.id] = p;
    }
  }

  let sent = 0, failed = 0;
  const staleIds: string[] = [];

  await Promise.allSettled(subs.map(async (sub) => {
    const profile = sub.user_id ? profileMap[sub.user_id] : null;

    // Decide which message to send
    let msg: { title: string; body: string };
    if (profile) {
      const streak   = profile.current_streak ?? 0;
      const lastDate = profile.last_activity_date ?? '';
      if (lastDate === today && streak === 5) {
        // They just hit their 5-day milestone today
        msg = STREAK_5_DAY;
      } else if (lastDate === yesterday && streak > 0) {
        // They were on a streak but haven't practiced yet today
        msg = STREAK_WARNING;
      } else {
        msg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
      }
    } else {
      // Guest subscriber — send a random daily reminder
      msg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
    }

    const payload      = JSON.stringify({ ...msg, url: '/', tag: 'mmr-daily' });
    const subscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };

    try {
      await webPush.sendNotification(subscription, payload);
      sent++;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) staleIds.push(sub.id);
      failed++;
    }
  }));

  if (staleIds.length > 0) {
    await supa.from('push_subscriptions').delete().in('id', staleIds);
  }

  // Trimmed response: summary counts only. The previous version returned
  // a per-subscriber `results` array with status codes and body text,
  // which exposed which subscription ids exist and which failed.
  return new Response(
    JSON.stringify({ sent, failed, stale_removed: staleIds.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
