const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const NOTIFY_EMAIL   = 'akeemjones93@gmail.com';

Deno.serve(async (req) => {
  let payload: any;
  try { payload = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const r = payload.record;
  if (!r) return new Response('No record', { status: 400 });

  const time     = new Date(r.first_seen).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }) + ' UTC';
  const referrer = r.referrer || 'Direct / unknown';
  const deviceId = r.device_id;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'My Math Roots <onboarding@resend.dev>',
      to:   [NOTIFY_EMAIL],
      subject: '🌱 New guest on My Math Roots',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#2d7a4f">🌱 New guest visitor</h2>
          <p>Someone just opened My Math Roots without signing up.</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Device ID</td>
                <td style="padding:6px 12px">${deviceId}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Time</td>
                <td style="padding:6px 12px">${time}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Came from</td>
                <td style="padding:6px 12px">${referrer}</td></tr>
          </table>
          <p style="margin-top:24px">
            <a href="https://supabase.com/dashboard/project/omjegwtzirskgmgeojdn/editor"
               style="background:#2d7a4f;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">
              View all sessions →
            </a>
          </p>
        </div>
      `,
    }),
  });

  const body = await res.text();
  return new Response(body, { status: res.ok ? 200 : 500 });
});
