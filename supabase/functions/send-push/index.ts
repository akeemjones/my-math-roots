import { createClient } from 'npm:@supabase/supabase-js@2';
import webPush from 'npm:web-push';

const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY    = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY   = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT       = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:developer@mymathroots.app';

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
  const authHeader = req.headers.get('Authorization');
  const isCron     = req.headers.get('x-supabase-cron') === 'true';
  if (!isCron && authHeader !== `Bearer ${SUPABASE_SERVICE_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Today / yesterday in UTC YYYY-MM-DD
  const now       = new Date();
  const today     = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);

  // Fetch every push subscription (include user_id for streak lookup)
  const { data: subs, error } = await supa
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, user_id');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  if (!subs || subs.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  // Bulk-fetch streak profiles for every subscriber who has an account
  const userIds = [...new Set(subs.map(s => s.user_id).filter(Boolean))];
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
  const results: unknown[] = [];

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
      const result = await webPush.sendNotification(subscription, payload);
      sent++;
      results.push({ id: sub.id, status: result.statusCode });
    } catch (e: any) {
      if (e.statusCode === 404 || e.statusCode === 410) staleIds.push(sub.id);
      failed++;
      results.push({ id: sub.id, status: e.statusCode, body: e.body, error: String(e.message ?? e) });
    }
  }));

  if (staleIds.length > 0) {
    await supa.from('push_subscriptions').delete().in('id', staleIds);
  }

  return new Response(
    JSON.stringify({ sent, failed, stale_removed: staleIds.length, results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
