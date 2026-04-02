<script lang="ts">
  /**
   * /dashboard — Main parent dashboard page.
   *
   * Assembles all dashboard components for the selected student.
   * Components read their own stores; this page just provides
   * the active student's accent color as a CSS custom property.
   */

  import { activeStudent } from '$lib/stores';
  import OverallStats from '$lib/components/dashboard/OverallStats.svelte';
  import QuizHistory from '$lib/components/dashboard/QuizHistory.svelte';
  import MasteryGrid from '$lib/components/dashboard/MasteryGrid.svelte';
  import AiReportCard from '$lib/components/dashboard/AiReportCard.svelte';
  import ParentSettings from '$lib/components/dashboard/ParentSettings.svelte';

  const accentColor = $derived($activeStudent?.avatar_color_from ?? '#6c5ce7');
</script>

<main class="dash-page" style="--color: {accentColor}">

  <section class="dash-section">
    <h2 class="section-title">📈 Overall Stats</h2>
    <OverallStats />
  </section>

  <section class="dash-section">
    <h2 class="section-title">📋 Quiz History</h2>
    <QuizHistory />
  </section>

  <section class="dash-section">
    <h2 class="section-title">🗺️ Mastery Map</h2>
    <MasteryGrid />
  </section>

  <section class="dash-section">
    <h2 class="section-title">🤖 AI Progress Report</h2>
    <AiReportCard />
  </section>

  <section class="dash-section">
    <h2 class="section-title">⚙️ Settings</h2>
    <ParentSettings />
  </section>

</main>

<style>
  .dash-page {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-bottom: 3rem;
  }

  .dash-section {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .section-title {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #636e72);
  }
</style>
