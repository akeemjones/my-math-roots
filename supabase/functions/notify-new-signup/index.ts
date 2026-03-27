const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const NOTIFY_EMAIL   = 'akeemjones93@gmail.com';

Deno.serve(async (req) => {
  // Accept requests carrying a valid Supabase anon/user JWT
  // (supa.functions.invoke() sends the current session's Bearer token automatically)
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
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
                <td style="padding:6px 12px">${display_name || '(not provided)'}</td></tr>
            <tr><td style="padding:6px 12px;background:#f0f9f4;font-weight:bold">Email</td>
                <td style="padding:6px 12px">${email}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Time</td>
                <td style="padding:6px 12px">${time}</td></tr>
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
