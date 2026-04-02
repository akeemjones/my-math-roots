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
  import StudentCard from '$lib/components/auth/StudentCard.svelte';
  import PinKeypad from '$lib/components/auth/PinKeypad.svelte';
  import { familyProfiles, activeStudentId, authUser } from '$lib/stores';
  import { verifyStudentPin, signOut } from '$lib/services/auth';

  // Which student has been tapped (awaiting PIN)
  let pendingId = $state<string | null>(null);
  let pinError = $state('');
  let pinLoading = $state(false);

  const pending = $derived<import('$lib/types').StudentProfile | null>(
    pendingId ? ($familyProfiles.find(p => p.id === pendingId) ?? null) : null
  );

  async function handlePin(pin: string) {
    if (!pendingId) return;
    pinLoading = true;
    pinError = '';
    const { success, attemptsLeft, error } = await verifyStudentPin(pendingId, pin);
    pinLoading = false;

    if (error) {
      pinError = error;
      return;
    }

    if (success) {
      activeStudentId.set(pendingId);
      goto('/', { replaceState: true });
    } else {
      pinError = attemptsLeft !== null && attemptsLeft > 0
        ? `Wrong PIN. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
        : 'Account locked. Try again later.';
    }
  }

  async function handleSignOut() {
    await signOut();
    authUser.set(null);
    goto('/login', { replaceState: true });
  }
</script>

<main class="screen">
  {#if pending}
    <!-- PIN entry view -->
    <div class="pin-view">
      <div class="pin-header">
        <span class="pin-avatar">{pending.avatar_emoji}</span>
        <h2>Hi, {pending.display_name}!</h2>
        <p>Enter your PIN to continue</p>
      </div>

      <PinKeypad
        onSubmit={handlePin}
        onCancel={() => { pendingId = null; pinError = ''; }}
        disabled={pinLoading}
        error={pinError}
      />
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
              onSelect={() => { pendingId = profile.id; pinError = ''; }}
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
    background: linear-gradient(160deg, #f0f2f5 0%, #e8e3ff 100%);
  }

  /* ── PIN view ── */
  .pin-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .pin-header {
    text-align: center;
  }

  .pin-avatar {
    font-size: 4rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .pin-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .pin-header p {
    margin: 0.25rem 0 0;
    color: var(--color-text-muted, #636e72);
    font-size: 0.95rem;
  }

  /* ── Grid view ── */
  .grid-view {
    width: 100%;
    max-width: 36rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .app-brand {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--color-text, #2d3436);
  }

  .sign-out {
    background: none;
    border: none;
    color: var(--color-text-muted, #636e72);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    transition: background 0.15s;
  }

  .sign-out:hover {
    background: rgba(0,0,0,0.06);
  }

  .greeting {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    text-align: center;
    color: var(--color-text, #2d3436);
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .empty {
    text-align: center;
    color: var(--color-text-muted, #636e72);
    font-size: 0.95rem;
    line-height: 1.5;
    max-width: 24rem;
    margin: 0 auto;
  }
</style>
