const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const NOTIFY_NEW_SIGNUP_SECRET  = Deno.env.get('NOTIFY_NEW_SIGNUP_SECRET');
const NOTIFY_EMAIL              = 'akeemjones93@gmail.com';

// HTML-escape strings before interpolating into the Resend HTML body.
// Previously the function inlined `${display_name}` and `${email}`
// unescaped, so an attacker who got through signup-gate validation
// (max 30 chars, no character restriction on display_name) could inject
// markup into the admin's notification email.
function escHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

Deno.serve(async (req) => {
  // Require an exact shared-secret Authorization header. The previous
  // check only inspected the `Bearer ` prefix — any valid-looking token
  // would pass and could trigger Resend email spam to the admin inbox.
  // Mirror the notify-new-visitor edge function (which uses
  // NOTIFY_NEW_VISITOR_SECRET the same way after the 2026-05-01
  // hardening migration). Fail closed if the secret env var is unset.
  if (!NOTIFY_NEW_SIGNUP_SECRET) {
    return new Response('Server misconfigured', { status: 500 });
  }
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${NOTIFY_NEW_SIGNUP_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: any;
  try { payload = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const { email, display_name } = payload;
  if (!email) return new Response('No email', { status: 400 });

  const time = new Date().toLocaleString('en-US', {
    timeZone:  'America/Chicago',
    dateStyle: 'medium',
    timeStyle: 'short',
  }) + ' CT';

  const safeName  = escHtml(display_name || '(not provided)');
  const safeEmail = escHtml(email);
  const safeTime  = escHtml(time);

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'My Math Roots <onboarding@resend.dev>',
      to:      [NOTIFY_EMAIL],
      subject: '🎉 New account on My Math Roots',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#2d7a4f">🎉 New account created!</h2>
          <p>Someone just signed up on My Math Roots.</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Name</td>
                <td style="padding:6px 12px">${safeName}</td></tr>
            <tr><td style="padding:6px 12px;background:#f0f9f4;font-weight:bold">Email</td>
                <td style="padding:6px 12px">${safeEmail}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Time</td>
                <td style="padding:6px 12px">${safeTime}</td></tr>
          </table>
          <p style="margin-top:24px">
            <a href="https://supabase.com/dashboard/project/omjegwtzirskgmgeojdn/auth/users"
               style="background:#2d7a4f;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">
              View all users →
            </a>
          </p>
        </div>
      `,
    }),
  });

  const body = await res.text();
  return new Response(body, { status: res.ok ? 200 : 500 });
});
