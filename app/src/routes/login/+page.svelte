<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { signInWithGoogle } from '$lib/services/auth';
  import { verifyStudentPin } from '$lib/services/auth';
  import { supabase } from '$lib/supabase';
  import { familyProfiles, activeStudentId, guestMode, scores, done, mastery, streak, actDates, appTime, initialPullDone } from '$lib/stores';
  import { navStack } from '$lib/services/navStack';
  import type { StudentProfile } from '$lib/types';

  // ── Carousel ────────────────────────────────────────────────────────────────
  let activeCard = $state(0); // 0=student (default, matches legacy), 1=parent
  let trackEl = $state<HTMLDivElement | null>(null);

  // Swipe state (ported from legacy src/auth.js)
  let _startX = 0, _startY = 0, _startT = 0;
  let _intentSet = false, _isHoriz = false, _outerW = 0;
  const _EASE = 'cubic-bezier(0.4,0,0.2,1)';

  function onTrackTouchStart(e: TouchEvent) {
    _startX = e.touches[0].clientX;
    _startY = e.touches[0].clientY;
    _startT = Date.now();
    _intentSet = false;
    _isHoriz = false;
    _outerW = (trackEl?.parentElement || document.body).offsetWidth || window.innerWidth;
    if (trackEl) trackEl.style.transition = 'none';
  }

  function onTrackTouchMove(e: TouchEvent) {
    const dx = e.touches[0].clientX - _startX;
    const dy = e.touches[0].clientY - _startY;
    if (!_intentSet && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      _intentSet = true;
      _isHoriz = Math.abs(dx) > Math.abs(dy);
    }
    if (!_isHoriz || !trackEl) return;
    // Follow finger in pixels, clamped so you can't over-drag past either card
    const currentPx = activeCard * (-_outerW);
    const newPx = Math.max(-_outerW, Math.min(0, currentPx + dx));
    trackEl.style.transform = `translateX(${newPx}px)`;
  }

  function snapTo(targetIdx: number, duration = 0.28) {
    if (!trackEl) return;
    trackEl.style.transition = `transform ${duration}s ${_EASE}`;
    trackEl.style.transform = `translateX(${targetIdx * -50}%)`;
  }

  function onTrackTouchEnd(e: TouchEvent) {
    if (!_intentSet || !_isHoriz) {
      snapTo(activeCard, 0.28);
      return;
    }
    const dx = e.changedTouches[0].clientX - _startX;
    const gestureMs = Math.max(1, Date.now() - _startT);
    const velocity = Math.abs(dx) / gestureMs; // px/ms
    const isFast = velocity > 0.3 && Math.abs(dx) > 20;
    const committed = Math.abs(dx) >= _outerW * 0.5 || isFast;

    let targetIdx = activeCard;
    if (committed) {
      if (dx < 0 && activeCard < 1) targetIdx = 1;
      else if (dx > 0 && activeCard > 0) targetIdx = 0;
    }

    snapTo(targetIdx, 0.28);

    if (targetIdx !== activeCard) {
      setTimeout(() => { activeCard = targetIdx; }, 280);
    }
  }

  // ── Student PIN ─────────────────────────────────────────────────────────────
  let selectedStudentId = $state<string | null>(null);
  let pinBuffer = $state<number[]>([]);
  let pinError = $state('');
  let pinLoading = $state(false);
  let showFamilyCode = $state(false);
  let familyCode = $state('');
  let familyCodeMsg = $state('');
  let familyCodeLoading = $state(false);

  const selectedProfile = $derived<StudentProfile | null>(
    selectedStudentId ? ($familyProfiles.find(p => p.id === selectedStudentId) ?? null) : null
  );

  // ── Soft gate (guest consent modal) ─────────────────────────────────────────
  let showSoftGate = $state(false);
  let softGateConsent = $state(false);
  let softGateError = $state('');

  function openSoftGate() {
    softGateConsent = false;
    softGateError = '';
    showSoftGate = true;
  }

  function proceedAsGuest() {
    if (!softGateConsent) {
      softGateError = 'Please confirm you are a parent or guardian.';
      return;
    }
    showSoftGate = false;
    // Reset all progress stores so guest doesn't see previous user's data
    scores.set([]);
    done.set({});
    mastery.set({});
    streak.set({ current: 0, longest: 0, lastDate: null });
    actDates.set([]);
    appTime.set({ totalSecs: 0, sessions: 0, dailySecs: {} });
    activeStudentId.set(null);
    guestMode.set(true);
    initialPullDone.set(true);  // No cloud pull for guests — ungate tutorial/spotlight
    navStack.clear();
    goto('/');
  }

  // ── Parent form ──────────────────────────────────────────────────────────────
  let tab = $state<'login' | 'signup'>('login');
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let showPassword = $state(false);
  let rememberEmail = $state(false);
  let consentChecked = $state(false);
  let loading = $state(false);
  let errorMsg = $state('');

  const pwStrength = $derived.by(() => {
    if (tab !== 'signup' || !password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  });

  const pwStrengthLabel = $derived(['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength]);
  const pwStrengthColor = $derived(
    pwStrength <= 1 ? '#e74c3c' : pwStrength <= 2 ? '#f39c12' : pwStrength <= 3 ? '#f1c40f' : '#27ae60'
  );


  // ── Lifecycle ────────────────────────────────────────────────────────────────
  onMount(() => {
    const saved = localStorage.getItem('mmr_remember_email');
    if (saved) { email = saved; rememberEmail = true; }

    if ($familyProfiles.length > 0) {
      activeCard = 0;
      const lastId = localStorage.getItem('mmr_last_student_id');
      selectedStudentId = lastId && $familyProfiles.find(p => p.id === lastId)
        ? lastId : $familyProfiles[0].id;
    }

    // Listen for auth state changes (handles popup OAuth flow in PWA standalone mode)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loading = false;
        navStack.clear();
        goto('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  });

  // ── Student actions ──────────────────────────────────────────────────────────
  function selectStudent(id: string) {
    selectedStudentId = id;
    pinBuffer = [];
    pinError = '';
  }

  function handlePinNative(e: Event) {
    const inp = e.target as HTMLInputElement;
    const digits = inp.value.replace(/\D/g, '').slice(0, 4).split('').map(Number);
    pinBuffer = digits;
    inp.value = digits.join('');
    if (digits.length === 4) submitPin();
  }

  async function submitPin() {
    if (!selectedStudentId || pinLoading) return;
    pinLoading = true;
    pinError = '';
    const { success, attemptsLeft, error } = await verifyStudentPin(selectedStudentId, pinBuffer.join(''));
    pinLoading = false;
    if (error) { pinError = error; pinBuffer = []; return; }
    if (success) {
      localStorage.setItem('mmr_last_student_id', selectedStudentId);
      guestMode.set(false);
      activeStudentId.set(selectedStudentId);
      navStack.clear();
      goto('/', { replaceState: true });
    } else {
      pinBuffer = [];
      pinError = attemptsLeft !== null && attemptsLeft > 0
        ? `Wrong PIN. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
        : 'Account locked. Try again later.';
    }
  }

  async function handleFamilyCodeSetup() {
    const code = familyCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{3}-[A-Z0-9]{4}$/.test(code)) {
      familyCodeMsg = 'Enter a valid code (e.g. MMR-4829)';
      return;
    }
    familyCodeMsg = '';
    familyCodeLoading = true;
    try {
      const { data, error } = await supabase.rpc('get_profiles_by_family_code', { p_family_code: code });
      if (error) throw error;
      const profiles: StudentProfile[] = data || [];
      if (!profiles.length) {
        familyCodeMsg = 'Family code not found — check with your parent.';
        familyCodeLoading = false;
        return;
      }
      familyProfiles.set(profiles);
      selectedStudentId = profiles[0].id;
      pinBuffer = [];
      showFamilyCode = false;
    } catch {
      familyCodeMsg = 'Could not connect — check your internet and try again.';
    }
    familyCodeLoading = false;
  }

  // ── Parent auth ──────────────────────────────────────────────────────────────
  async function handleEmailAuth(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    if (rememberEmail) {
      localStorage.setItem('mmr_remember_email', email);
    } else {
      localStorage.removeItem('mmr_remember_email');
    }
    if (tab === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name.trim() || 'Parent' } },
      });
      loading = false;
      if (error) {
        errorMsg = error.message;
      } else if (data.user && !data.session) {
        errorMsg = '✅ Check your email to confirm your account.';
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email, password,
      });
      loading = false;
      if (error) { errorMsg = error.message; }
      else { navStack.clear(); goto('/dashboard'); }
    }
  }

  async function handleForgotPassword() {
    if (!email) { errorMsg = '⚠️ Enter your email address above first.'; return; }
    loading = true;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    loading = false;
    errorMsg = error ? `⚠️ ${error.message}` : '✅ Reset link sent — check your email!';
  }
</script>

<main class="sc screen">

  <!-- Animated logo -->
  <div class="logo-wrap">
    <div class="logo-svg">
      <svg viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ll1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient>
          <linearGradient id="ll2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient>
          <linearGradient id="lls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient>
          <linearGradient id="llb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient>
        </defs>
        <g stroke-linecap="round" fill="none">
          <path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3.0"/>
          <path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3.0"/>
          <path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/>
          <path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/>
          <path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/>
          <path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/>
        </g>
        <path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#lls)" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#ll1)"/>
        <path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#ll2)"/>
        <path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#llb)"/>
      </svg>
    </div>
    <h1 class="app-title">My Math Roots</h1>
    <p class="app-sub">K-5 REVIEW</p>
  </div>

  <!-- Two-card carousel -->
  <div class="ls-carousel-outer">
    <div class="ls-carousel-track"
         bind:this={trackEl}
         style="transform: translateX({activeCard === 0 ? '0%' : '-50%'})"
         ontouchstart={onTrackTouchStart}
         ontouchmove={onTrackTouchMove}
         ontouchend={onTrackTouchEnd}>

      <!-- Card 0: Student -->
      <div class="ls-card">
        <div class="ls-card-role-hd">
          <div class="ls-card-role-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;filter:drop-shadow(0 2px 12px rgba(255,210,0,0.65))">
              <defs><linearGradient id="st-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe566"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs>
              <polygon points="20,3 24.1,14.3 36.2,14.8 26.7,22.2 30.0,33.8 20,27 10.0,33.8 13.3,22.2 3.8,14.8 15.9,14.3" fill="url(#st-g)"/>
            </svg>
          </div>
          <div class="ls-card-role-title">Student</div>
          <div class="ls-card-role-sub">Sign in to track your progress</div>
        </div>

        {#if !$familyProfiles.length || showFamilyCode}
          <!-- Family code entry -->
          <div class="ls-fam-code-wrap">
            <div class="ls-fam-label">Enter your family code</div>
            <input
              class="set-inp"
              type="text"
              placeholder="MMR-0000"
              maxlength="8"
              bind:value={familyCode}
              style="text-align:center;letter-spacing:.15em;text-transform:uppercase"
              oninput={(e) => {
                const inp = e.target as HTMLInputElement;
                const raw = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                const formatted = raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3, 7) : raw;
                familyCode = formatted;
                inp.value = formatted;
              }}
            />
            {#if familyCodeMsg}
              <div class="ls-fam-msg">{familyCodeMsg}</div>
            {/if}
            <button
              type="button"
              class="ls-link-btn"
              onclick={handleFamilyCodeSetup}
              disabled={familyCodeLoading}
            >
              {familyCodeLoading ? '…' : 'Link This Device'}
            </button>
            {#if $familyProfiles.length}
              <button type="button" class="ls-back-link" onclick={() => showFamilyCode = false}>← Back</button>
            {/if}
          </div>
        {:else}
          <!-- Student avatar picker -->
          <div style="margin-bottom:14px">
            <div class="ls-fam-label">Who's playing?</div>
            <div class="ls-avatar-row">
              {#each $familyProfiles as profile}
                {@const isSelected = selectedStudentId === profile.id}
                <div
                  class="ls-avatar-item {isSelected ? 'ls-avatar-selected' : ''}"
                  role="button"
                  tabindex="0"
                  aria-label={profile.display_name}
                  onclick={() => selectStudent(profile.id)}
                  onkeydown={(e) => e.key === 'Enter' && selectStudent(profile.id)}
                >
                  <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,{profile.avatar_color_from},{profile.avatar_color_to});display:flex;align-items:center;justify-content:center;font-size:1.5rem;{isSelected ? 'border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 0 0 3px rgba(245,158,11,0.45),0 4px 12px rgba(0,0,0,0.3);opacity:1' : 'border:2.5px solid rgba(255,255,255,0.25);box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0.7'}">
                    {profile.avatar_emoji}
                  </div>
                  <div style="font-size:.72rem;color:{isSelected ? '#fff' : 'rgba(255,255,255,0.65)'};font-weight:{isSelected ? '700' : '600'};margin-top:5px">{profile.display_name}</div>
                </div>
              {/each}
            </div>
          </div>

          {#if selectedProfile}
            <div style="border-top:1px solid rgba(255,255,255,0.14);padding-top:14px;position:relative">
              <div class="ls-fam-label">{selectedProfile.display_name}'s PIN</div>
              <!-- 4-dot display -->
              <div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px" id="ls-pin-dots">
                {#each [0,1,2,3] as i}
                  <div class="ls-pin-dot {i < pinBuffer.length ? 'ls-pin-dot-filled' : 'ls-pin-dot-empty'}"></div>
                {/each}
              </div>
              {#if pinError}
                <div class="ls-pin-msg">{pinError}</div>
              {/if}
              {#if pinLoading}
                <div class="ls-pin-msg" style="color:rgba(255,255,255,0.6)">Checking…</div>
              {/if}
              <!-- Invisible native number input — triggers keyboard on mobile -->
              <input
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="4"
                autocomplete="one-time-code"
                value={pinBuffer.join('')}
                oninput={handlePinNative}
                class="ls-pin-native-inp"
                aria-label="Enter PIN"
              />
              <div class="ls-new-device-row">
                New device?
                <button type="button" class="ls-new-device-link" onclick={() => { showFamilyCode = true; familyCodeMsg = ''; }}>
                  Enter family code →
                </button>
              </div>
            </div>
          {/if}
        {/if}

        <!-- Guest link inside student card -->
        <button type="button" class="ls-guest-btn" onclick={openSoftGate} style="margin-top:auto;padding-top:14px">
          Continue without an account →
        </button>
      </div><!-- Card 0 -->

      <!-- Card 1: Parent / Teacher -->
      <div class="ls-card">
        <div class="ls-card-role-hd">
          <div class="ls-card-role-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">
              <line x1="6" y1="34" x2="36" y2="34" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="6" y1="8" x2="6" y2="34" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/>
              <polyline points="9,30 17,22 25,16 33,9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="30" r="2.5" fill="#fff"/>
              <circle cx="17" cy="22" r="2.5" fill="#fff"/>
              <circle cx="25" cy="16" r="2.5" fill="#fff"/>
              <circle cx="33" cy="9" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <div class="ls-card-role-title">Parent / Teacher</div>
          <div class="ls-card-role-sub">View progress &amp; manage settings</div>
        </div>

        <!-- Google OAuth -->
        <button type="button" class="ls-google-btn btn-google" onclick={async () => { loading = true; const r = await signInWithGoogle(); if (r.error) { errorMsg = r.error; loading = false; } }} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div class="ls-divider"><span>or</span></div>

        <!-- Sign In / Create Account tabs -->
        <div class="ls-tab-row">
          <button type="button" class="auth-tab-btn {tab === 'login' ? 'active' : 'idle'}" onclick={() => { tab = 'login'; errorMsg = ''; }}>Sign In</button>
          <button type="button" class="auth-tab-btn {tab === 'signup' ? 'active' : 'idle'}" onclick={() => { tab = 'signup'; errorMsg = ''; }}>Create Account</button>
        </div>

        <form onsubmit={handleEmailAuth} novalidate>

          <!-- Name (signup only) -->
          {#if tab === 'signup'}
            <div style="margin-bottom:8px">
              <input class="set-inp" type="text" placeholder="Your name *" bind:value={name} maxlength="30" required disabled={loading} />
            </div>
          {/if}

          <!-- Email -->
          <div style="margin-bottom:6px">
            <input class="set-inp" type="email" placeholder="Email address" bind:value={email} autocomplete="email" inputmode="email" required disabled={loading} />
          </div>

          <!-- Remember email -->
          <div class="ls-remember-row">
            <input type="checkbox" id="ls-remember" bind:checked={rememberEmail} style="width:16px;height:16px;accent-color:#4a90d9;cursor:pointer;flex-shrink:0" />
            <label for="ls-remember" class="ls-remember-lbl">Remember my email</label>
          </div>

          <!-- Password + reveal toggle -->
          <div class="ls-pw-wrap" style="margin-bottom:4px">
            <input
              class="set-inp"
              type={showPassword ? 'text' : 'password'}
              placeholder={tab === 'signup' ? 'Password (min 8 characters)' : 'Password'}
              bind:value={password}
              autocomplete={tab === 'signup' ? 'new-password' : 'current-password'}
              required
              disabled={loading}
              style="padding-right:44px"
            />
            <button
              type="button"
              class="ls-pw-toggle"
              onclick={() => showPassword = !showPassword}
              tabindex="-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {/if}
            </button>
          </div>

          <!-- Password strength (signup) -->
          {#if tab === 'signup' && password}
            <div class="ls-pw-strength-wrap">
              <div class="ls-pw-strength-bar" style="width:{pwStrength * 25}%;background:{pwStrengthColor}"></div>
            </div>
            <div class="ls-pw-strength-lbl" style="color:{pwStrengthColor}">{pwStrengthLabel}</div>
          {/if}

          <!-- Forgot password (login only) -->
          {#if tab === 'login'}
            <div class="ls-forgot-row">
              <button type="button" class="ls-forgot-btn" onclick={handleForgotPassword} disabled={loading}>
                Forgot password?
              </button>
            </div>
          {/if}

          <!-- Parental consent (signup only) -->
          {#if tab === 'signup'}
            <div class="ls-consent-row">
              <label class="ls-consent-label">
                <input type="checkbox" bind:checked={consentChecked} style="margin-top:2px;flex-shrink:0;width:16px;height:16px;cursor:pointer;accent-color:#4a90d9" required />
                <span>I am a parent or guardian of the child using this app</span>
              </label>
            </div>
          {/if}

          {#if errorMsg}
            <div class="ls-msg" style="color:{errorMsg.startsWith('✅') ? '#27ae60' : '#e74c3c'}">{errorMsg}</div>
          {/if}

          <button
            type="submit"
            class="btn-primary"
            disabled={loading || (tab === 'signup' && !consentChecked)}
          >
            {loading ? '…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

        </form>
      </div><!-- Card 1 -->

    </div><!-- .ls-carousel-track -->

    <!-- Carousel dots — inside outer so they sit below the cards -->
    <div class="ls-dots">
      <button type="button" class="ls-dot {activeCard === 0 ? 'active' : ''}" onclick={() => { activeCard = 0; snapTo(0); }} aria-label="Student login"></button>
      <button type="button" class="ls-dot {activeCard === 1 ? 'active' : ''}" onclick={() => { activeCard = 1; snapTo(1); }} aria-label="Parent / Teacher login"></button>
    </div>
  </div><!-- .ls-carousel-outer -->

</main>

<!-- Soft gate consent modal -->
{#if showSoftGate}
<div class="sg-overlay" role="dialog" aria-modal="true" aria-label="Welcome" onclick={() => showSoftGate = false}>
  <div class="sg-card" onclick={(e) => e.stopPropagation()}>
    <div class="sg-header">
      <div class="sg-wave">👋</div>
      <div class="sg-title">Welcome to My Math Roots!</div>
      <div class="sg-sub">This app is designed for K–5 students.<br>A quick note for parents before you begin.</div>
    </div>

    <div class="sg-consent-wrap">
      <label class="sg-consent-label {softGateError ? 'sg-consent-error' : ''}">
        <input
          type="checkbox"
          bind:checked={softGateConsent}
          onchange={() => { if (softGateConsent) softGateError = ''; }}
          style="margin-top:2px;flex-shrink:0;width:17px;height:17px;cursor:pointer;accent-color:#ff6b00"
        />
        <span>I am a parent or guardian of the child using this app</span>
      </label>
      <div class="sg-legal">
        By continuing, you agree to our
        <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>
        and <a href="/terms" target="_blank" rel="noopener">Terms of Service</a>.
      </div>
    </div>

    {#if softGateError}
      <div class="sg-msg">{softGateError}</div>
    {/if}

    <button type="button" class="sg-continue-btn" onclick={proceedAsGuest}>
      Continue as Guest →
    </button>
    <button type="button" class="sg-account-btn" onclick={() => { showSoftGate = false; activeCard = 1; }}>
      Create a Free Account
    </button>
  </div>
</div>
{/if}

<style>
  .screen {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem 2rem;
    gap: 0;
    /* Override the global light gradient — login needs a dark background so white text is readable */
    background-image: var(--app-bg-svg), linear-gradient(155deg, #2563b0 0%, #1d7a49 100%) !important;
    background-size: 420px 420px, 100% 100% !important;
  }

  /* Logo */
  .logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  .logo-svg {
    width: 72px; height: 72px;
    animation: bob 1.5s ease-in-out infinite;
    filter: drop-shadow(0 3px 6px rgba(0,80,20,0.18));
  }
  .logo-svg svg { width: 100%; height: 100%; }
  .app-title {
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif;
    font-size: var(--fs-3xl, 2.5rem);
    text-transform: uppercase;
    margin: 0.15rem 0 0;
    color: #fff;
    text-shadow: 0 2px 12px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.25);
    letter-spacing: 0.02em;
  }
  .app-sub {
    font-size: var(--fs-sm, 0.85rem);
    font-weight: 800;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.1em;
    margin: 0.1rem 0 0;
  }

  /* Card internals */
  .ls-fam-label {
    font-size: .68rem;
    color: rgba(255,255,255,.55);
    text-transform: uppercase;
    letter-spacing: .08em;
    text-align: center;
    margin-bottom: 10px;
  }
  .ls-fam-code-wrap { display: flex; flex-direction: column; gap: 8px; }
  .ls-fam-msg { font-size: .78rem; color: #f87171; text-align: center; min-height: 1.2rem; }
  .ls-link-btn {
    width: 100%; padding: 13px; border-radius: 50px; border: none;
    background: linear-gradient(135deg,#f59e0b,#f97316); color: #fff;
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-md);
    cursor: pointer; letter-spacing: .3px; touch-action: manipulation;
  }
  .ls-link-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ls-back-link {
    background: none; border: none; color: rgba(255,255,255,.6);
    font-size: var(--fs-sm); cursor: pointer; text-decoration: underline; padding: 0;
  }
  .ls-pin-native-inp {
    position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%;
    font-size: 16px; cursor: pointer; border: none; outline: none; background: transparent;
  }
  .ls-pin-msg { font-size: .75rem; color: #f87171; text-align: center; min-height: 1.1rem; margin-bottom: 6px; }
  .ls-new-device-row { margin-top: 8px; text-align: center; font-size: .68rem; color: rgba(255,255,255,.35); }
  .ls-new-device-link {
    color: rgba(255,210,80,.85); text-decoration: underline; cursor: pointer;
    background: none; border: none; font-size: inherit; padding: 0;
  }

  /* Google btn override */
  .btn-google {
    display: flex; align-items: center; justify-content: center; gap: .625rem;
    padding: .7rem 1rem; border-radius: 50px; cursor: pointer; width: 100%;
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-base);
    transition: opacity .15s;
  }
  .btn-google:disabled { opacity: .6; cursor: not-allowed; }

  /* Divider */
  .ls-divider {
    display: flex; align-items: center; gap: .75rem;
    color: rgba(255,255,255,.65); font-size: var(--fs-sm);
    margin: .5rem 0;
  }
  .ls-divider::before, .ls-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.25);
  }

  /* Tab row */
  .ls-tab-row {
    display: flex; border: 2px solid rgba(255,255,255,.28); border-radius: 50px;
    overflow: hidden; margin-bottom: .75rem;
  }

  /* Form helpers */
  .ls-remember-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  }
  .ls-remember-lbl {
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif;
    font-size: var(--fs-sm); color: rgba(255,255,255,.75); cursor: pointer; user-select: none;
  }
  .ls-pw-wrap { position: relative; }
  .ls-pw-toggle {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px; line-height: 1;
    color: rgba(255,255,255,.6); -webkit-tap-highlight-color: transparent;
  }
  .ls-pw-strength-wrap {
    height: 5px; border-radius: 50px; background: rgba(255,255,255,.2); overflow: hidden; margin-bottom: 3px;
  }
  .ls-pw-strength-bar { height: 100%; border-radius: 50px; transition: width .25s, background .25s; }
  .ls-pw-strength-lbl { font-size: var(--fs-xs); text-align: right; margin-bottom: 6px; }
  .ls-forgot-row { text-align: left; margin-bottom: 6px; }
  .ls-forgot-btn {
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-sm);
    color: rgba(120,190,255,.9); background: none; border: none; cursor: pointer;
    padding: 0; text-decoration: underline; -webkit-tap-highlight-color: transparent;
  }
  .ls-consent-row { margin-bottom: 10px; }
  .ls-consent-label {
    display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
    font-size: var(--fs-sm); color: rgba(255,255,255,.8); line-height: 1.45;
    padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid rgba(120,160,220,.25); background: rgba(255,255,255,.08);
  }
  .ls-msg {
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif;
    font-size: var(--fs-base); min-height: 1.4rem; margin-bottom: 8px; text-align: center;
  }

  /* Submit */
  .btn-primary {
    width: 100%; padding: .85rem; border-radius: 50px; border: none;
    background: linear-gradient(135deg,#4a90d9,#27ae60); color: #fff;
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-md);
    cursor: pointer; box-shadow: 0 5px 0 rgba(0,0,0,.15); transition: opacity .15s;
    touch-action: manipulation;
  }
  .btn-primary:disabled { opacity: .6; cursor: not-allowed; }

  /* Guest link */
  .ls-guest-btn {
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-base);
    background: none; border: none; color: rgba(255,255,255,.65); cursor: pointer;
    text-decoration: underline; touch-action: manipulation; width: 100%; text-align: center;
  }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  /* ── Soft gate modal ── */
  .sg-overlay {
    position: fixed; inset: 0; z-index: 9000;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .sg-card {
    width: 100%; max-width: 360px; border-radius: 24px;
    padding: 28px 24px 22px;
    background: linear-gradient(145deg,rgba(255,255,255,0.95) 0%,rgba(240,248,255,0.88) 100%);
    box-shadow: 0 8px 40px rgba(60,120,200,0.18), 0 2px 12px rgba(0,0,0,0.08), inset 0 1.5px 0 rgba(255,255,255,0.98);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  .sg-header { text-align: center; margin-bottom: 22px; }
  .sg-wave { font-size: 2.2rem; margin-bottom: 8px; }
  .sg-title {
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif;
    font-size: var(--fs-lg); color: var(--txt, #222); line-height: 1.2;
  }
  .sg-sub { font-size: var(--fs-sm); color: var(--txt2, #666); margin-top: 8px; line-height: 1.55; }
  .sg-consent-wrap { margin-bottom: 18px; }
  .sg-consent-label {
    display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
    font-size: var(--fs-sm); color: var(--txt, #222); line-height: 1.45;
    padding: 12px 14px; border-radius: 12px;
    border: 1.5px solid rgba(120,160,220,0.3);
    background: rgba(255,255,255,0.55);
    transition: border-color .15s;
  }
  .sg-consent-label.sg-consent-error { border-color: #e74c3c; }
  .sg-legal {
    margin-top: 8px; font-size: var(--fs-xs); color: var(--txt2, #888);
    text-align: center; line-height: 1.5;
  }
  .sg-legal a { color: #3b82f6; text-decoration: underline; }
  .sg-msg { font-size: var(--fs-sm); color: #e74c3c; text-align: center; min-height: 1.2rem; margin-bottom: 8px; }
  .sg-continue-btn {
    width: 100%; padding: 13px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #ff6b00, #e05200); color: #fff;
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-md);
    cursor: pointer; margin-bottom: 10px; letter-spacing: .3px; touch-action: manipulation;
  }
  .sg-account-btn {
    width: 100%; padding: 12px; border-radius: 14px;
    border: 2px solid #4a90d9; background: transparent; color: #4a90d9;
    font-family: 'Boogaloo','Arial Rounded MT Bold',sans-serif; font-size: var(--fs-base);
    cursor: pointer; touch-action: manipulation;
  }
</style>
