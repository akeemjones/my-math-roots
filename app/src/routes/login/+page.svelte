<script lang="ts">
  /**
   * /login — Parent sign-in screen.
   *
   * Supports:
   *  - Email + password sign-in
   *  - Google OAuth (one-tap redirect)
   *
   * On successful sign-in the root layout's onAuthStateChange listener
   * updates the authUser store and the auth guard redirects to /select.
   */

  import { signInWithEmail, signInWithGoogle } from '$lib/services/auth';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let errorMsg = $state('');

  async function handleEmailSignIn(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    const { error } = await signInWithEmail(email, password);
    loading = false;
    if (error) errorMsg = error;
    // On success, onAuthStateChange in the layout handles redirect.
  }

  async function handleGoogleSignIn() {
    loading = true;
    errorMsg = '';
    const { error } = await signInWithGoogle();
    // signInWithGoogle() triggers a browser redirect; we only reach here on error.
    loading = false;
    if (error) errorMsg = error;
  }
</script>

<main class="screen">
  <div class="card">
    <div class="logo">
      <span class="logo-emoji">🌱</span>
      <h1>My Math Roots</h1>
      <p class="subtitle">Parent Sign In</p>
    </div>

    <form onsubmit={handleEmailSignIn} novalidate>
      <label class="field">
        <span>Email</span>
        <input
          type="email"
          bind:value={email}
          placeholder="parent@example.com"
          autocomplete="email"
          required
          disabled={loading}
        />
      </label>

      <label class="field">
        <span>Password</span>
        <input
          type="password"
          bind:value={password}
          placeholder="••••••••"
          autocomplete="current-password"
          required
          disabled={loading}
        />
      </label>

      {#if errorMsg}
        <p class="error" role="alert">{errorMsg}</p>
      {/if}

      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>

    <div class="divider"><span>or</span></div>

    <button type="button" class="btn-google" onclick={handleGoogleSignIn} disabled={loading}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.1 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
        <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.7-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.8 2.2-6.3 0-11.6-4.3-13.5-10l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  </div>
</main>

<style>
  .screen {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .card {
    background: var(--color-surface, #fff);
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 22rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .logo {
    text-align: center;
  }

  .logo-emoji {
    font-size: 3rem;
  }

  h1 {
    margin: 0.25rem 0 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text, #2d3436);
  }

  .subtitle {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: var(--color-text-muted, #636e72);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-muted, #636e72);
  }

  .field input {
    padding: 0.65rem 0.875rem;
    border: 2px solid var(--color-border, #dfe6e9);
    border-radius: 0.75rem;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.15s;
    background: var(--color-surface, #fff);
    color: var(--color-text, #2d3436);
  }

  .field input:focus {
    border-color: var(--color-primary, #6c5ce7);
  }

  .error {
    font-size: 0.85rem;
    color: var(--color-error, #d63031);
    margin: 0;
    text-align: center;
  }

  .btn-primary {
    padding: 0.75rem;
    border-radius: 0.875rem;
    border: none;
    background: var(--color-primary, #6c5ce7);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-text-muted, #636e72);
    font-size: 0.8rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border, #dfe6e9);
  }

  .btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 0.75rem;
    border-radius: 0.875rem;
    border: 2px solid var(--color-border, #dfe6e9);
    background: var(--color-surface, #fff);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .btn-google:hover {
    background: var(--color-surface-alt, #f8f9fa);
    border-color: #aaa;
  }

  .btn-google:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
