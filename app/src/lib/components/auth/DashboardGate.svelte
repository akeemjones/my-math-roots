<script lang="ts">
  /**
   * DashboardGate — soft auth modal for students who want to access the parent dashboard.
   * Shows Google sign-in + email/password login. On success, navigates to /dashboard.
   * Triggered from the Settings page "Go to Dashboard" button.
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { signInWithGoogle } from '$lib/services/auth';

  const { onClose }: { onClose: () => void } = $props();

  let email    = $state('');
  let password = $state('');
  let loading  = $state(false);
  let errorMsg = $state('');
  let showPw   = $state(false);

  // Listen for OAuth popup callback
  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loading = false;
        onClose();
        goto('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  });

  async function handleGoogle() {
    loading = true;
    errorMsg = '';
    const { error } = await signInWithGoogle();
    if (error) { errorMsg = error; loading = false; }
    // On success, onAuthStateChange fires above
  }

  async function handleEmail(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    loading = false;
    if (error) { errorMsg = error.message; }
    else { onClose(); goto('/dashboard'); }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="gate-overlay" onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
  <div class="gate-box">
    <button type="button" class="gate-close-x" onclick={onClose} aria-label="Close">✕</button>

    <div class="gate-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:2.4rem;height:2.4rem;color:#fff">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </div>
    <h2 class="gate-title">Parent Dashboard</h2>
    <p class="gate-sub">Sign in to access parent controls, student progress, and settings.</p>

    <!-- Google -->
    <button type="button" class="google-btn" onclick={handleGoogle} disabled={loading}>
      <svg viewBox="0 0 48 48" style="width:20px;height:20px;flex-shrink:0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      Continue with Google
    </button>

    <div class="gate-divider"><span>or sign in with email</span></div>

    <!-- Email form -->
    <form onsubmit={handleEmail} class="gate-form">
      <input
        type="email"
        class="gate-input"
        placeholder="Parent email"
        bind:value={email}
        required
        autocomplete="email"
        disabled={loading}
      />
      <div class="gate-pw-wrap">
        <input
          type={showPw ? 'text' : 'password'}
          class="gate-input"
          placeholder="Password"
          bind:value={password}
          required
          autocomplete="current-password"
          disabled={loading}
        />
        <button
          type="button"
          class="gate-pw-eye"
          onclick={() => showPw = !showPw}
          tabindex="-1"
          aria-label={showPw ? 'Hide password' : 'Show password'}
        >
          {#if showPw}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.1rem;height:1.1rem;display:block">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.1rem;height:1.1rem;display:block">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          {/if}
        </button>
      </div>

      {#if errorMsg}
        <p class="gate-error">{errorMsg}</p>
      {/if}

      <button type="submit" class="gate-submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
    </form>
  </div>
</div>

<style>
  .gate-overlay {
    position: fixed; inset: 0; z-index: 9900;
    display: flex; align-items: center; justify-content: center;
    padding: max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom));
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .gate-box {
    position: relative;
    background: rgba(255,255,255,0.13);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1.5px solid rgba(255,255,255,0.3);
    border-radius: 28px;
    padding: 32px 24px 28px;
    max-width: 400px; width: 100%;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45), inset 0 1.5px 0 rgba(255,255,255,0.25);
    animation: gateUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes gateUp {
    from { transform: translateY(40px) scale(0.96); opacity: 0; }
    to   { transform: translateY(0)    scale(1);    opacity: 1; }
  }

  .gate-close-x {
    position: absolute; top: 14px; right: 16px;
    background: rgba(255,255,255,0.15); border: none; border-radius: 50%;
    width: 32px; height: 32px; font-size: 0.9rem; cursor: pointer; color: #fff;
    display: flex; align-items: center; justify-content: center;
    -webkit-tap-highlight-color: transparent;
  }

  .gate-icon { display: flex; justify-content: center; margin-bottom: 6px; }

  .gate-title {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.6rem; color: #fff; text-align: center; margin: 0 0 6px;
  }

  .gate-sub {
    font-size: 0.85rem; color: rgba(255,255,255,0.75);
    text-align: center; line-height: 1.5; margin: 0 0 20px;
  }

  .google-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    font-family: 'Nunito', sans-serif; font-size: 0.95rem; font-weight: 700;
    padding: 12px 20px; border-radius: 14px; cursor: pointer;
    background: #fff; color: #1a2535; border: none;
    box-shadow: 0 3px 10px rgba(0,0,0,0.18);
    transition: transform .1s, box-shadow .1s;
    -webkit-tap-highlight-color: transparent;
  }
  .google-btn:active { transform: translateY(2px); box-shadow: 0 1px 4px rgba(0,0,0,0.18); }
  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .gate-divider {
    display: flex; align-items: center; gap: 10px;
    margin: 18px 0 14px; color: rgba(255,255,255,0.45); font-size: 0.8rem;
  }
  .gate-divider::before, .gate-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.2);
  }

  .gate-form { display: flex; flex-direction: column; gap: 10px; }

  .gate-input {
    width: 100%; padding: 12px 14px; border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.12); color: #fff;
    font-family: 'Nunito', sans-serif; font-size: 0.95rem;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }
  .gate-input::placeholder { color: rgba(255,255,255,0.45); }
  .gate-input:focus { outline: none; border-color: rgba(74,144,217,0.8); }
  .gate-input:disabled { opacity: 0.6; }

  .gate-pw-wrap { position: relative; }
  .gate-pw-wrap .gate-input { padding-right: 44px; }
  .gate-pw-eye {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; font-size: 1.1rem;
    padding: 4px; line-height: 1; -webkit-tap-highlight-color: transparent;
  }

  .gate-error {
    font-size: 0.82rem; color: #ff6b6b; margin: 0;
    background: rgba(255,107,107,0.12); border-radius: 8px; padding: 8px 12px;
  }

  .gate-submit {
    width: 100%; padding: 13px;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: 1.1rem; border: none; border-radius: 50px; cursor: pointer; color: #fff;
    background: linear-gradient(135deg, #4a90d9, #357abd);
    box-shadow: 0 4px 0 rgba(0,0,0,0.2);
    transition: transform .1s, box-shadow .1s;
    -webkit-tap-highlight-color: transparent;
    margin-top: 2px;
  }
  .gate-submit:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.2); }
  .gate-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
</style>
