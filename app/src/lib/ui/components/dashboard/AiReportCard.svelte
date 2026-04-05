<script lang="ts">
  /**
   * AiReportCard — AI progress report with 14-day cooldown gate.
   *
   * Report state is stored per-student in localStorage via the aiReports store.
   * Actual Gemini call is STUBBED (STUB_MODE = true) — same pattern as hint.ts.
   * When false, will POST to /.netlify/functions/gemini-report.
   */

  import { aiReports, activeStudentId, scores, mastery, streak } from '$lib/core/stores';
  import { get } from 'svelte/store';

  const STUB_MODE = true;
  const COOLDOWN_DAYS = 14;

  // ── Derived state ─────────────────────────────────────────────────────────────

  const studentId = $derived($activeStudentId ?? '');
  const report    = $derived($aiReports[studentId] ?? null);

  const daysSince = $derived.by(() => {
    if (!report?.lastDate) return Infinity;
    const last  = new Date(report.lastDate).getTime();
    const now   = Date.now();
    return Math.floor((now - last) / (1000 * 60 * 60 * 24));
  });

  const daysRemaining = $derived(
    daysSince < COOLDOWN_DAYS ? COOLDOWN_DAYS - Math.floor(daysSince) : 0
  );

  const canGenerate = $derived(!report || daysSince >= COOLDOWN_DAYS);

  // ── Generate stub ─────────────────────────────────────────────────────────────

  let loading = $state(false);
  let error   = $state('');

  async function generateReport() {
    if (!studentId || loading) return;
    loading = true;
    error   = '';

    try {
      let text: string;

      if (STUB_MODE) {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));

        const allScores = get(scores);
        const totalQs   = allScores.reduce((s, e) => s + e.total, 0);
        const correct   = allScores.reduce((s, e) => s + e.score, 0);
        const pct       = totalQs > 0 ? Math.round((correct / totalQs) * 100) : 0;
        const curStreak = get(streak).current;

        text = [
          `📊 Progress Report — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          '',
          `Overall Accuracy: ${pct}% across ${allScores.length} quiz${allScores.length !== 1 ? 'zes' : ''}.`,
          `Current streak: ${curStreak} day${curStreak !== 1 ? 's' : ''}.`,
          '',
          pct >= 80
            ? '✅ Excellent work! This student is demonstrating strong mastery of the material. Keep up the consistent practice to maintain the streak.'
            : pct >= 60
            ? '📈 Good progress! This student is building confidence. Focusing on the amber lessons in the Mastery Map will help improve overall accuracy.'
            : '💡 This student is getting started. Regular short practice sessions of 10–15 minutes will help build the foundational habits needed for success.',
          '',
          '⚠️ Note: This is a stub report. Connect the Gemini API in Phase 7 to generate real personalised insights.',
        ].join('\n');
      } else {
        const res = await fetch('/.netlify/functions/gemini-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        text = data.report ?? 'No report returned.';
      }

      aiReports.update(r => ({
        ...r,
        [studentId]: {
          lastDate: new Date().toISOString().slice(0, 10),
          text,
        },
      }));

    } catch (e) {
      error = 'Failed to generate report. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="report-card">

  {#if !report}
    <!-- No report yet -->
    <div class="empty-state">
      <p class="empty-msg">No report generated yet for this student.</p>
      <button
        type="button"
        class="generate-btn"
        onclick={generateReport}
        disabled={loading}
      >
        {#if loading}
          <span class="spinner-sm"></span> Generating…
        {:else}
          🤖 Generate First Report
        {/if}
      </button>
    </div>

  {:else if !canGenerate}
    <!-- On cooldown -->
    <div class="cooldown-banner">
      <span class="cooldown-icon">⏳</span>
      <div class="cooldown-text">
        <strong>Next report in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>
        <span>Reports refresh every {COOLDOWN_DAYS} days</span>
      </div>
    </div>
    <div class="report-body">
      {#each report.text.split('\n') as line}
        {#if line.trim() === ''}
          <br />
        {:else}
          <p>{line}</p>
        {/if}
      {/each}
    </div>

  {:else}
    <!-- Eligible for new report -->
    <div class="refresh-banner">
      <span>Last report: {new Date(report.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      <button
        type="button"
        class="generate-btn small"
        onclick={generateReport}
        disabled={loading}
      >
        {#if loading}
          <span class="spinner-sm"></span> Generating…
        {:else}
          🔄 Generate New Report
        {/if}
      </button>
    </div>
    <div class="report-body">
      {#each report.text.split('\n') as line}
        {#if line.trim() === ''}
          <br />
        {:else}
          <p>{line}</p>
        {/if}
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="error-msg">{error}</p>
  {/if}

</div>

<style>
  .report-card {
    background: var(--color-surface, #fff);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  /* Empty state */
  .empty-state {
    padding: 2rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }

  .empty-msg {
    margin: 0;
    color: var(--color-text-muted, #636e72);
    font-size: 0.9rem;
  }

  /* Generate button */
  .generate-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    border: none;
    background: var(--color, #6c5ce7);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
    box-shadow: 0 3px 10px color-mix(in srgb, var(--color, #6c5ce7) 30%, transparent);
  }

  .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .generate-btn:not(:disabled):hover { opacity: 0.88; }

  .generate-btn.small {
    padding: 0.45rem 0.875rem;
    font-size: 0.8rem;
    box-shadow: none;
  }

  /* Cooldown banner */
  .cooldown-banner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1.25rem;
    background: color-mix(in srgb, #fdcb6e 15%, #fff);
    border-bottom: 1px solid var(--color-border, #dfe6e9);
  }

  .cooldown-icon { font-size: 1.5rem; }

  .cooldown-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    font-size: 0.85rem;
    color: var(--color-text, #2d3436);
  }

  .cooldown-text span {
    font-size: 0.75rem;
    color: var(--color-text-muted, #636e72);
  }

  /* Refresh banner */
  .refresh-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--color-border, #dfe6e9);
    font-size: 0.8rem;
    color: var(--color-text-muted, #636e72);
  }

  /* Report body */
  .report-body {
    padding: 1rem 1.25rem;
    max-height: 16rem;
    overflow-y: auto;
    font-size: 0.875rem;
    color: var(--color-text, #2d3436);
    line-height: 1.65;
  }

  .report-body p {
    margin: 0 0 0.1rem;
  }

  /* Error */
  .error-msg {
    padding: 0.75rem 1.25rem;
    color: #d63031;
    font-size: 0.82rem;
    margin: 0;
    font-weight: 600;
  }

  /* Tiny spinner */
  .spinner-sm {
    display: inline-block;
    width: 0.85rem;
    height: 0.85rem;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
