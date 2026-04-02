<script lang="ts">
  /**
   * UnitCard — tappable card for a curriculum unit on the home screen.
   * 3-state rendering matching legacy src/home.js buildHome():
   *   - cs-active  (current unit — full card with progress bar + "Let's Go!")
   *   - cs-done    (completed — compact card, no progress bar, no enter button)
   *   - cs-locked  (locked — lock icon + name, tap shows toast)
   */

  const {
    id, name, icon, svg, color, teks,
    locked = false,
    done = false,
    current = false,
    lessonsTotal = 0,
    lessonsDone = 0,
    uqDone = false,
    onSelect,
    onLockTap,
  }: {
    id: string;
    name: string;
    icon: string;
    svg: string;
    color: string;
    teks: string;
    locked?: boolean;
    done?: boolean;
    current?: boolean;
    lessonsTotal?: number;
    lessonsDone?: number;
    uqDone?: boolean;
    onSelect: () => void;
    onLockTap?: () => void;
  } = $props();

  const unitNum = $derived(id.replace(/\D/g, ''));
  const lpct = $derived(lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0);
</script>

{#if locked}
  <!-- Locked card (matches legacy cs-locked-slide / cs-lock-card) -->
  <div class="cs cs-locked-slide" style="margin-bottom:8px">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="cs-lock-card"
         onclick={onLockTap}
         role="region"
         aria-label="Unit {unitNum}, {name}, locked">
      <div class="cs-lock-ico" aria-hidden="true">{@html svg || icon}</div>
      <div class="cs-lock-info">
        <div class="cs-lock-label">Unit {unitNum}</div>
        <div class="cs-lock-name">{name}</div>
      </div>
      <span class="cs-lock-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:middle;display:inline-block"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
    </div>
  </div>

{:else if current}
  <!-- Active / current card (matches legacy cs-active / cs-card) -->
  <div class="cs cs-active" style="--uc:{color};margin-bottom:12px">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="cs-card" style="background:var(--card-bg);cursor:pointer"
         onclick={onSelect}
         role="region"
         aria-label="Unit {unitNum}, {name}, current, {lessonsDone} of {lessonsTotal} lessons done">
      <div class="cs-label">Unit {unitNum} · Current</div>
      <span class="cs-icon" aria-hidden="true">{@html svg || icon}</span>
      <div class="cs-name">{name}</div>
      <div class="cs-pb"
           role="progressbar"
           aria-valuenow={lpct}
           aria-valuemin={0}
           aria-valuemax={100}
           aria-label="{lpct}% complete">
        <div class="cs-pbf" style="width:{lpct}%;background:{color}"></div>
      </div>
      <div class="cs-stat">{lessonsDone}/{lessonsTotal} lessons done{uqDone ? ' · Unit Quiz ✅' : ''}</div>
      <div class="cs-enter-btn" style="background:linear-gradient(135deg,{color},{color}bb)"
           role="button" aria-label="Open Unit {unitNum}">
        Let's Go! →
      </div>
    </div>
  </div>

{:else}
  <!-- Done / completed card (matches legacy cs-done / cs-card) -->
  <div class="cs cs-done" style="--uc:{color};margin-bottom:10px">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="cs-card" style="background:var(--card-bg);cursor:pointer"
         onclick={onSelect}
         role="region"
         aria-label="Unit {unitNum}, {name}, {lessonsDone} of {lessonsTotal} done{uqDone ? ', unit quiz passed' : ''}">
      <div class="cs-label" style="color:{color}">Unit {unitNum}{uqDone ? ' · ✅' : ''}</div>
      <span class="cs-icon" aria-hidden="true">{@html svg || icon}</span>
      <div class="cs-name">{name}</div>
      <div class="cs-stat">{lessonsDone}/{lessonsTotal} done{uqDone ? ' · Quiz ✅' : ''}</div>
    </div>
  </div>
{/if}
