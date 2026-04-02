<script lang="ts">
  /**
   * OverallStats — 6-chip stat grid for the parent dashboard.
   *
   * Reads directly from stores — no props needed.
   * Chips: Accuracy, Quizzes Taken, Current Streak, Longest Streak,
   *        Weekly Time, Questions Seen.
   */

  import { scores, mastery, streak, recentSecs } from '$lib/stores';

  // ── Derived values ─────────────────────────────────────────────────────────

  const accuracyPct = $derived.by(() => {
    const allScores = $scores;
    if (allScores.length === 0) return 0;
    const totalCorrect = allScores.reduce((s, e) => s + e.score, 0);
    const totalQs      = allScores.reduce((s, e) => s + e.total, 0);
    return totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
  });

  const totalQuizzes  = $derived($scores.length);
  const curStreak     = $derived($streak.current);
  const longestStreak = $derived($streak.longest);

  const weeklyMins = $derived.by(() => {
    // recentSecs is a derived store returning a (days) => number function
    const fn = $recentSecs as (days?: number) => number;
    return Math.round(fn(7) / 60);
  });

  const questionsSeen = $derived(Object.keys($mastery).length);

  // Colour for accuracy chip
  const accuracyColor = $derived(
    accuracyPct >= 80 ? '#00b894'
    : accuracyPct >= 60 ? '#fdcb6e'
    : '#e17055'
  );

  const chips = $derived([
    { label: 'Accuracy',       value: `${accuracyPct}%`,      icon: '🎯', color: accuracyColor },
    { label: 'Quizzes Taken',  value: String(totalQuizzes),   icon: '📝', color: '#6c5ce7' },
    { label: 'Streak',         value: `${curStreak}d`,        icon: '🔥', color: '#e17055' },
    { label: 'Best Streak',    value: `${longestStreak}d`,    icon: '🏆', color: '#fdcb6e' },
    { label: 'Weekly Time',    value: `${weeklyMins}m`,       icon: '⏱️', color: '#0984e3' },
    { label: 'Qs Seen',        value: String(questionsSeen),  icon: '🧠', color: '#00cec9' },
  ]);
</script>

<div class="stat-grid">
  {#each chips as chip}
    <div class="stat-tile" style="--chip-color: {chip.color}">
      <span class="stat-ico">{chip.icon}</span>
      <span class="stat-num">{chip.value}</span>
      <span class="stat-lbl">{chip.label}</span>
    </div>
  {/each}
</div>
