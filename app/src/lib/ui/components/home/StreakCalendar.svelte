<script lang="ts">
  import { streak, actDates } from '$lib/core/stores';

  interface Props {
    onClose: () => void;
  }
  let { onClose }: Props = $props();

  // ── Month navigation ──────────────────────────────────────────────────────
  const now = new Date();
  let viewYear  = $state(now.getFullYear());
  let viewMonth = $state(now.getMonth()); // 0-based

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function prevMonth() {
    if (viewMonth === 0) { viewMonth = 11; viewYear--; }
    else viewMonth--;
  }
  function nextMonth() {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return; // can't go forward past today's month
    if (viewMonth === 11) { viewMonth = 0; viewYear++; }
    else viewMonth++;
  }

  // Is this the current month?
  const isCurrentMonth = $derived(
    viewYear === now.getFullYear() && viewMonth === now.getMonth()
  );

  // ── Calendar grid builder ─────────────────────────────────────────────────
  interface CalDay {
    date:     number;      // day of month (1-31), 0 = empty padding cell
    key:      string;      // 'YYYY-MM-DD' or ''
    isToday:  boolean;
    isActive: boolean;     // user logged time this day
  }

  // Build a Set from actDates for O(1) lookups
  const actSet = $derived(new Set($actDates));

  const calDays = $derived.by<CalDay[]>(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayKey = toKey(now);

    const cells: CalDay[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: 0, key: '', isToday: false, isActive: false });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toKey(new Date(viewYear, viewMonth, d));
      cells.push({
        date: d,
        key,
        isToday: key === todayKey,
        isActive: actSet.has(key),
      });
    }

    return cells;
  });

  function toKey(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // ── Streak stats ──────────────────────────────────────────────────────────
  const currentStreak = $derived($streak?.current ?? 0);
  const bestStreak    = $derived($streak?.longest ?? 0);

  // Count active days in the viewed month
  const activeDaysInMonth = $derived(calDays.filter(c => c.isActive).length);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="sc-overlay" onclick={onClose}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="sc-card" onclick={(e) => e.stopPropagation()}>

    <!-- Header -->
    <div class="sc-header">
      <div class="sc-fire">🔥</div>
      <div class="sc-streak-nums">
        <span class="sc-streak-current">{currentStreak}-day streak</span>
        {#if bestStreak > currentStreak}
          <span class="sc-streak-best">Best: {bestStreak} days</span>
        {/if}
      </div>
      <button type="button" class="sc-close-btn" onclick={onClose} aria-label="Close streak calendar">✕</button>
    </div>

    <!-- Month navigation -->
    <div class="sc-month-nav">
      <button type="button" class="sc-nav-btn" onclick={prevMonth} aria-label="Previous month">‹</button>
      <span class="sc-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
      <button
        type="button"
        class="sc-nav-btn {isCurrentMonth ? 'sc-nav-btn-disabled' : ''}"
        onclick={nextMonth}
        disabled={isCurrentMonth}
        aria-label="Next month"
      >›</button>
    </div>

    <!-- Day-of-week headers -->
    <div class="sc-grid sc-day-labels">
      {#each DAY_LABELS as label}
        <div class="sc-day-label">{label}</div>
      {/each}
    </div>

    <!-- Calendar grid -->
    <div class="sc-grid sc-cal-grid">
      {#each calDays as cell}
        {#if cell.date === 0}
          <div class="sc-cell sc-cell-empty"></div>
        {:else}
          <div
            class="sc-cell {cell.isActive ? 'sc-cell-active' : ''} {cell.isToday ? 'sc-cell-today' : ''}"
            title={cell.isActive ? `${cell.date} — Active` : String(cell.date)}
          >
            {#if cell.isActive}
              <span class="sc-cell-fire">🔥</span>
            {:else}
              <span class="sc-cell-num">{cell.date}</span>
            {/if}
          </div>
        {/if}
      {/each}
    </div>

    <!-- Month summary footer -->
    <div class="sc-footer">
      {#if activeDaysInMonth > 0}
        <span class="sc-footer-stat">
          🎉 {activeDaysInMonth} active day{activeDaysInMonth === 1 ? '' : 's'} this month
        </span>
      {:else}
        <span class="sc-footer-stat sc-footer-empty">No activity this month yet — keep going!</span>
      {/if}
    </div>

  </div>
</div>

<style>
  .sc-overlay {
    position: fixed;
    inset: 0;
    z-index: 9700;
    background: rgba(0, 0, 0, 0.52);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .sc-card {
    background: var(--bg, #fff);
    border-radius: 22px;
    width: 100%;
    max-width: 380px;
    padding: 20px 20px 24px;
    box-shadow: 0 24px 60px rgba(0,0,0,.30), 0 0 0 1px rgba(0,0,0,.05);
    animation: sc-pop .28s cubic-bezier(.34,1.56,.64,1) both;
  }

  @keyframes sc-pop {
    from { opacity: 0; transform: scale(.88); }
    to   { opacity: 1; transform: scale(1);  }
  }

  /* ── Header ── */
  .sc-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }
  .sc-fire {
    font-size: 2rem;
    line-height: 1;
  }
  .sc-streak-nums {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sc-streak-current {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-lg, 1.3rem);
    color: #e06000;
    line-height: 1.1;
  }
  .sc-streak-best {
    font-size: var(--fs-sm, 0.85rem);
    color: var(--txt2, #666);
  }
  .sc-close-btn {
    background: var(--bg2, #f0f0f0);
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    font-size: 1rem;
    color: var(--txt2, #666);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .sc-close-btn:active { background: var(--border2, #ddd); }

  /* ── Month nav ── */
  .sc-month-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .sc-nav-btn {
    background: var(--bg2, #f0f0f0);
    border: none;
    border-radius: 10px;
    width: 36px;
    height: 36px;
    font-size: 1.4rem;
    color: var(--txt, #222);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s, opacity .15s;
    -webkit-tap-highlight-color: transparent;
    line-height: 1;
  }
  .sc-nav-btn:active:not(:disabled) { background: var(--border2, #ddd); }
  .sc-nav-btn-disabled,
  .sc-nav-btn:disabled {
    opacity: 0.28;
    cursor: default;
  }
  .sc-month-label {
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', sans-serif;
    font-size: var(--fs-md, 1.1rem);
    color: var(--txt, #222);
    letter-spacing: .3px;
  }

  /* ── Grid ── */
  .sc-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  .sc-day-labels { margin-bottom: 4px; }
  .sc-day-label {
    text-align: center;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--txt2, #888);
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: 2px 0;
  }

  /* ── Cells ── */
  .sc-cell {
    aspect-ratio: 1;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--fs-sm, 0.85rem);
    position: relative;
    transition: background .15s;
  }
  .sc-cell-empty {
    background: transparent;
  }
  .sc-cell-num {
    color: var(--txt2, #aaa);
    font-size: 0.82rem;
    font-weight: 500;
  }
  .sc-cell-active {
    background: linear-gradient(135deg, #fff3e0, #ffe0a0);
    border: 1.5px solid rgba(255, 140, 0, 0.40);
  }
  .sc-cell-active .sc-cell-fire {
    font-size: 1.15rem;
    line-height: 1;
  }
  .sc-cell-today {
    box-shadow: 0 0 0 2.5px #4a90d9;
  }
  .sc-cell-today:not(.sc-cell-active) {
    background: rgba(74, 144, 217, 0.08);
  }
  .sc-cell-today .sc-cell-num {
    color: #4a90d9;
    font-weight: 700;
  }

  /* ── Footer ── */
  .sc-footer {
    margin-top: 14px;
    text-align: center;
    min-height: 1.4rem;
  }
  .sc-footer-stat {
    font-size: var(--fs-sm, 0.85rem);
    color: var(--txt2, #777);
    font-family: 'Nunito', sans-serif;
  }
  .sc-footer-empty {
    font-style: italic;
  }
</style>
