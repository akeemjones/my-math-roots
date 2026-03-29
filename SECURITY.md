# Security Policy — My Math Roots

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately via GitHub's Security Advisories feature or contact the maintainer directly. Do not open a public issue.

## Security Controls in Place

### Authentication
- **Google OAuth** with PKCE flow and nonce verification
- **Email/password auth** via Supabase Auth with password strength validation
- **Parent PIN** hashed with SHA-256 + app salt; rate-limited (5 attempts / 30s lockout)
- Default PIN ("1234") requires mandatory change before parent controls are accessible

### Transport & Headers
- **HSTS** enforced (1 year, includeSubDomains, preload)
- **CSP** restricts scripts/styles/connections to specific trusted origins only
- `upgrade-insecure-requests` directive forces HTTPS for all sub-resources
- `X-Frame-Options: DENY` prevents clickjacking
- `X-Content-Type-Options: nosniff` prevents MIME-type sniffing
- `Permissions-Policy` blocks camera, microphone, geolocation, and payment APIs

### Push Notifications
- Web Push encryption per RFC 8291 (ECDH) and RFC 8188 (aes128gcm)
- VAPID JWT signing for push authorization
- Private keys stored server-side in Supabase Edge Function environment variables

### Service Worker
- Origin validation on `postMessage` events
- Fetch handler restricted to same-origin and trusted font CDN
- Cache versioning prevents stale content

### Build
- JavaScript obfuscation (build-time only, not a security boundary)
- HTML/CSS minification
- npm dependencies are build-only and never shipped to users

## Accepted Risks

| Item | Risk Level | Justification |
|------|------------|---------------|
| `unsafe-inline` in CSP `script-src` and `style-src` | Low | Required by single-file PWA architecture. Mitigated by `frame-ancestors 'none'`, `object-src 'none'`, and no user-generated content in inline scripts. |
| Google GSI and Cloudflare Turnstile loaded without SRI | Low | These CDNs serve dynamically versioned scripts whose hashes change per request. Mitigated by CSP restricting script sources to their specific origins. |
| Supabase anon key in client source | Informational | Supabase anon keys are designed for public use. All data access is governed by Row Level Security (RLS) policies server-side. |
| Google OAuth client ID in client source | Informational | OAuth 2.0 client IDs are public by specification. Redirect URIs are restricted in Google Cloud Console. |
| `innerHTML` usage with hardcoded data | Low | All `innerHTML` calls use data from compile-time constants (`UNITS_DATA`, `_ICO` SVG icons), never user input. |

## Recommendations for Future Hardening

- **Add Subresource Integrity (SRI)** for the Supabase CDN script by pinning to an exact version and computing a SHA-384 hash
- **Consider build-time secret injection** for Supabase URL/key if the project moves to a CI/CD pipeline with environment variable support
- **Run `npm audit`** periodically to check build dependencies for known vulnerabilities
