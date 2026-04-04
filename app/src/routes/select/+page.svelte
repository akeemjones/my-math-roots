<script lang="ts">
  /**
   * /select — Student selection + PIN verification screen.
   *
   * Flow:
   *  1. Shows all student cards for the signed-in family.
   *  2. Tapping a card shows the PIN keypad.
   *  3. Correct PIN → sets activeStudentId → layout guard redirects to /.
   *  4. Wrong PIN → shows attempts remaining message.
   *  5. Parent can sign out from here.
   */

  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import StudentCard from '$lib/components/auth/StudentCard.svelte';
  import { familyProfiles, activeStudentId, authUser } from '$lib/stores';
  import { verifyStudentPin, signOut } from '$lib/services/auth';
  import type { StudentProfile } from '$lib/types';

  // Which student has been tapped (awaiting PIN)
  let pendingId = $state<string | null>(null);
  let pinBuffer = $state<string[]>([]);
  let pinError = $state('');
  let pinLoading = $state(false);
  let pinInput = $state<HTMLInputElement | null>(null);

  const pending = $derived<StudentProfile | null>(
    pendingId ? ($familyProfiles.find(p => p.id === pendingId) ?? null) : null
  );

  // Focus the hidden PIN input when a student is selected (triggers iOS keyboard)
  $effect(() => {
    if (pending && pinInput) {
      tick().then(() => pinInput?.focus());
    }
  });

  function handlePinInput(e: Event) {
    const inp = e.target as HTMLInputElement;
    const raw = inp.value.replace(/\D/g, '').slice(0, 4);
    pinBuffer = raw.split('');
    inp.value = raw;
    if (raw.length === 4) submitPin(raw);
  }

  async function submitPin(pin: string) {
    if (!pendingId || pinLoading) return;
    pinLoading = true;
    pinError = '';
    const { success, attemptsLeft, error } = await verifyStudentPin(pendingId, pin);
    pinLoading = false;

    if (error) {
      pinError = error;
      pinBuffer = [];
      if (pinInput) pinInput.value = '';
      return;
    }

    if (success) {
      activeStudentId.set(pendingId);
      goto('/', { replaceState: true });
    } else {
      pinBuffer = [];
      if (pinInput) pinInput.value = '';
      pinError = attemptsLeft !== null && attemptsLeft > 0
        ? `Wrong PIN. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
        : 'Account locked. Try again later.';
    }
  }

  async function handleSignOut() {
    await signOut();
    authUser.set(null);
    activeStudentId.set(null);
    familyProfiles.set([]);
    goto('/login', { replaceState: true });
  }
</script>

<main class="screen">
  {#if pending}
    <!-- PIN entry view with native keyboard -->
    <div class="pin-view">
      <div class="pin-header">
        <span class="pin-avatar">{pending.avatar_emoji}</span>
        <h2>Hi, {pending.display_name}!</h2>
        <p>Enter your PIN to continue</p>
      </div>

      <!-- Dot indicators -->
      <div class="pin-dots">
        {#each [0,1,2,3] as i}
          <span class="pin-dot" class:pin-dot-filled={i < pinBuffer.length}></span>
        {/each}
      </div>

      {#if pinError}
        <p class="pin-error" role="alert">{pinError}</p>
      {/if}
      {#if pinLoading}
        <p class="pin-loading">Checking…</p>
      {/if}

      <!-- Hidden native input — triggers iOS numeric keyboard -->
      <input
        bind:this={pinInput}
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="4"
        autocomplete="one-time-code"
        value={pinBuffer.join('')}
        oninput={handlePinInput}
        class="pin-native-input"
        aria-label="Enter PIN"
      />

      <button type="button" class="pin-cancel" onclick={() => { pendingId = null; pinError = ''; pinBuffer = []; }}>← Back</button>
    </div>
  {:else}
    <!-- Student grid view -->
    <div class="grid-view">
      <header class="top-bar">
        <div class="app-brand">
          <span>🌱</span>
          <span>My Math Roots</span>
        </div>
        <button type="button" class="sign-out" onclick={handleSignOut}>Sign out</button>
      </header>

      <h2 class="greeting">Who's learning today?</h2>

      {#if $familyProfiles.length === 0}
        <p class="empty">No students added yet. Set up a student profile in the parent dashboard.</p>
      {:else}
        <div class="cards">
          {#each $familyProfiles as profile}
            <StudentCard
              name={profile.display_name}
              avatar={profile.avatar_emoji}
              color={profile.avatar_color_from}
              selected={false}
              onSelect={() => { pendingId = profile.id; pinError = ''; pinBuffer = []; }}
            />
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</main>

<style>
  .screen {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  /* ── PIN view ── */
  .pin-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .pin-header {
    text-align: center;
  }

  .pin-avatar {
    font-size: 4.5rem;
    display: block;
    margin-bottom: 0.5rem;
    animation: bob 2.5s ease-in-out infinite;
  }

  .pin-header h2 {
    margin: 0;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-2xl, 2rem);
    color: var(--txt, #1a2535);
  }

  .pin-header p {
    margin: 0.25rem 0 0;
    color: var(--txt2, #5a7080);
    font-size: var(--fs-base, 0.95rem);
  }

  .pin-dots {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .pin-dot {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    border: 2.5px solid var(--color-primary, #6c5ce7);
    background: transparent;
    transition: background 0.15s, transform 0.15s;
  }

  .pin-dot-filled {
    background: var(--color-primary, #6c5ce7);
    transform: scale(1.15);
  }

  .pin-error {
    font-size: 0.85rem;
    color: var(--color-error, #d63031);
    text-align: center;
    margin: 0;
  }

  .pin-loading {
    font-size: 0.85rem;
    color: var(--txt2, #5a7080);
    text-align: center;
    margin: 0;
  }

  /* Hidden native input — positioned over dots so tapping dots opens keyboard */
  .pin-native-input {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 10rem;
    height: 3rem;
    opacity: 0;
    font-size: 1.5rem;
    z-index: 2;
    margin-top: -3.5rem;
  }

  .pin-cancel {
    background: none;
    border: none;
    color: var(--txt2, #5a7080);
    font-size: var(--fs-base, 0.95rem);
    cursor: pointer;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
  }

  /* ── Grid view ── */
  .grid-view {
    width: 100%;
    max-width: 36rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .app-brand {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-lg, 1.3rem);
    color: var(--txt, #1a2535);
  }

  .sign-out {
    background: none;
    border: none;
    color: var(--txt2, #5a7080);
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-sm, 0.85rem);
    cursor: pointer;
    padding: 0.35rem 0.75rem;
    border-radius: 50px;
    border: 1.5px solid var(--border2, rgba(0,0,0,.16));
    transition: background 0.15s;
  }

  .sign-out:hover { background: var(--bg, #e4eeff); }

  .greeting {
    margin: 0;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-2xl, 2rem);
    text-align: center;
    color: var(--txt, #1a2535);
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .empty {
    text-align: center;
    color: var(--txt2, #5a7080);
    font-size: var(--fs-base, 0.95rem);
    line-height: 1.5;
    max-width: 24rem;
    margin: 0 auto;
  }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
</style>
