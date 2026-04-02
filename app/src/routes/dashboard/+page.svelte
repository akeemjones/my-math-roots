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
    <div class="dash-section-title">📈 Overall Stats</div>
    <OverallStats />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">📋 Quiz History</div>
    <QuizHistory />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">🗺️ Mastery Map</div>
    <MasteryGrid />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">🤖 AI Progress Report</div>
    <AiReportCard />
  </section>

  <section class="dash-section">
    <div class="dash-section-title">⚙️ Settings</div>
    <ParentSettings />
  </section>

</main>
