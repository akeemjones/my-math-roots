import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:developer@mymathroots.app';

// ── VAPID signing helpers ────────────────────────────────────────────────────
function b64urlToUint8(b64: string): Uint8Array {
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function uint8ToB64url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function makeVapidJwt(audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: VAPID_SUBJECT,
  };
  const encode = (obj: unknown) => uint8ToB64url(new TextEncoder().encode(JSON.stringify(obj)));
  const unsigned = `${encode(header)}.${encode(payload)}`;

  // Import private key
  const privKey = await crypto.subtle.importKey(
    'pkcs8',
    (() => {
      // Reconstruct PKCS8 from raw 32-byte scalar
      const raw = b64urlToUint8(VAPID_PRIVATE_KEY);
      const header = new Uint8Array([0x30,0x41,0x02,0x01,0x00,0x30,0x13,0x06,0x07,0x2a,0x86,0x48,0xce,0x3d,0x02,0x01,0x06,0x08,0x2a,0x86,0x48,0xce,0x3d,0x03,0x01,0x07,0x04,0x27,0x30,0x25,0x02,0x01,0x01,0x04,0x20]);
      const der = new Uint8Array(header.length + raw.length);
      der.set(header); der.set(raw, header.length);
      return der.buffer;
    })(),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privKey,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${uint8ToB64url(new Uint8Array(sig))}`;
}

// ── Web Push encryption (RFC 8291 / RFC 8188) ────────────────────────────────
async function encryptPushPayload(subscription: {
  endpoint: string; p256dh: string; auth: string;
}, payload: string): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const recipientPublicKey = b64urlToUint8(subscription.p256dh);
  const authSecret = b64urlToUint8(subscription.auth);

  // Generate server ephemeral key pair
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']
  );
  const serverPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeyPair.publicKey));

  // Import recipient public key
  const recipientKey = await crypto.subtle.importKey(
    'raw', recipientPublicKey, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: recipientKey }, serverKeyPair.privateKey, 256
  ));

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF extract + expand (RFC 8291)
  const concat = (...arrs: Uint8Array[]) => {
    const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0));
    let i = 0; for(const a of arrs){ out.set(a, i); i += a.length; } return out;
  };

  const baseKey = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveBits']);
  const authInfo = new TextEncoder().encode('WebPush: info\x00');
  const prk = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: concat(authInfo, recipientPublicKey, serverPublicKeyRaw) },
    baseKey, 256
  ));

  const prkKey = await crypto.subtle.importKey('raw', prk, 'HKDF', false, ['deriveBits']);
  const keyInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\x00');
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\x00');

  const contentKey = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: keyInfo }, prkKey, 128
  ));
  const nonce = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, prkKey, 96
  ));

  const aesKey = await crypto.subtle.importKey('raw', contentKey, 'AES-GCM', false, ['encrypt']);
  const plaintext = new TextEncoder().encode(payload);
  const padded = concat(plaintext, new Uint8Array([2])); // padding delimiter

  const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded);

  return { ciphertext: new Uint8Array(ciphertextBuf), salt, serverPublicKey: serverPublicKeyRaw };
}

async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth: string }, message: object): Promise<Response> {
  const payloadStr = JSON.stringify(message);
  const { ciphertext, salt, serverPublicKey } = await encryptPushPayload(subscription, payloadStr);

  // Build aes128gcm content-encoding header (RFC 8188)
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, 4096, false);
  const keyIdLen = new Uint8Array([serverPublicKey.length]);
  const body = new Uint8Array([...salt, ...recordSize, ...keyIdLen, ...serverPublicKey, ...ciphertext]);

  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await makeVapidJwt(audience);

  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body,
  });
}

// ── Message catalogue ────────────────────────────────────────────────────────
const MESSAGES = [
  { title: '🌱 Math time!', body: "Your sprout is waiting. Do a lesson today!" },
  { title: '📚 Keep growing!', body: "Just a few minutes of math makes a big difference." },
  { title: '⭐ You\'re on a streak!', body: "Keep it going — open My Math Roots and practice today." },
  { title: '🎯 Challenge yourself!', body: "Ready for a quiz? Pick up where you left off." },
  { title: '🌟 Practice makes perfect!', body: "A short lesson today keeps the rust away!" },
];

// ── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Allow cron invocations (no auth header) and manual calls with service key
  const authHeader = req.headers.get('Authorization');
  const isCron = req.headers.get('x-supabase-cron') === 'true';
  if (!isCron && authHeader !== `Bearer ${SUPABASE_SERVICE_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch all subscriptions (no user filter — send to everyone)
  const { data: subs, error } = await supa
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  if (!subs || subs.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const payload = { ...msg, url: '/', tag: 'mmr-daily' };

  let sent = 0, failed = 0;
  const staleIds: string[] = [];

  await Promise.allSettled(subs.map(async (sub) => {
    try {
      const res = await sendWebPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload);
      if (res.status === 201 || res.status === 200) {
        sent++;
      } else if (res.status === 404 || res.status === 410) {
        // Subscription expired — remove it
        staleIds.push(sub.id);
        failed++;
      } else {
        failed++;
        console.warn(`Push failed for ${sub.id}: ${res.status}`);
      }
    } catch (e) {
      failed++;
      console.error(`Push error for ${sub.id}:`, e);
    }
  }));

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supa.from('push_subscriptions').delete().in('id', staleIds);
  }

  return new Response(JSON.stringify({ sent, failed, stale_removed: staleIds.length }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
});
