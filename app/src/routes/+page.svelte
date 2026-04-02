<script lang="ts">
  /**
   * / — Home screen: grid of all 10 curriculum units.
   * Phase 4 implementation.
   */

  import { goto } from '$app/navigation';
  import { unitsData, activeStudent } from '$lib/stores';
  import UnitCard from '$lib/components/home/UnitCard.svelte';

  // Group units by grade period for visual sections
  const GP_LABELS: Record<number, string> = {
    1: 'Grade Period 1',
    2: 'Grade Period 2',
    3: 'Grade Period 3',
    4: 'Grade Period 4',
  };

  const grouped = $derived(() => {
    const map = new Map<number, typeof $unitsData>();
    for (const unit of $unitsData) {
      const arr = map.get(unit.gp) ?? [];
      arr.push(unit);
      map.set(unit.gp, arr);
    }
    return map;
  });
</script>

<main class="screen">
  <header class="top-bar">
    <div class="greeting">
      <span class="avatar">{$activeStudent?.avatar_emoji ?? '🌱'}</span>
      <div>
        <p class="hi">Hi, {$activeStudent?.display_name ?? 'there'}!</p>
        <p class="sub">What are we learning today?</p>
      </div>
    </div>
  </header>

  <div class="content">
    {#if $unitsData.length === 0}
      <p class="loading">Loading curriculum…</p>
    {:else}
      {#each [1, 2, 3, 4] as gp}
        {#if grouped().has(gp)}
          <section class="gp-section">
            <h2 class="gp-label">{GP_LABELS[gp]}</h2>
            <div class="unit-grid">
              {#each grouped().get(gp) ?? [] as unit}
                <UnitCard
                  id={unit.id}
                  name={unit.name}
                  icon={unit.icon}
                  svg={unit.svg}
                  color={unit.color}
                  teks={unit.teks}
                  locked={false}
                  progress={0}
                  onSelect={() => goto(`/unit/${unit.id}`)}
                />
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    {/if}
  </div>
</main>

<style>
  .screen {
    min-height: 100dvh;
    background: var(--color-bg, #f0f2f5);
    display: flex;
    flex-direction: column;
  }

  .top-bar {
    background: var(--color-surface, #fff);
    padding: 1rem 1.25rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .greeting {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    font-size: 2.5rem;
    line-height: 1;
  }

  .hi {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-text, #2d3436);
  }

  .sub {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text-muted, #636e72);
  }

  .content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    flex: 1;
  }

  .gp-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .gp-label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted, #636e72);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .unit-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.875rem;
  }

  @media (min-width: 600px) {
    .unit-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .loading {
    color: var(--color-text-muted, #636e72);
    text-align: center;
    padding: 3rem 0;
  }
</style>
