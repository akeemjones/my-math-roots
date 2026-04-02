<script lang="ts">
  /**
   * UnitCard — tappable card for a curriculum unit on the home screen.
   *
   * Props:
   *   id       — unit id, e.g. "u3"
   *   name     — display name
   *   icon     — emoji icon
   *   svg      — inline SVG illustration
   *   color    — brand hex color
   *   teks     — TEKS standard label
   *   locked   — whether the unit is locked (future: based on progress)
   *   progress — 0–1 completion fraction for the progress ring
   *   onSelect — called when the card is tapped
   */

  const {
    id, name, icon, svg, color, teks,
    locked = false,
    progress = 0,
    onSelect,
  }: {
    id: string;
    name: string;
    icon: string;
    svg: string;
    color: string;
    teks: string;
    locked?: boolean;
    progress?: number;
    onSelect: () => void;
  } = $props();

  // Progress ring geometry
  const R = 22;
  const CIRC = 2 * Math.PI * R;
  const dash = $derived(progress * CIRC);
</script>

<button
  type="button"
  class="card"
  class:locked
  style="--color: {color}"
  onclick={onSelect}
  aria-label="{name} — {teks}"
  aria-disabled={locked}
>
  <!-- SVG illustration -->
  <div class="illustration" aria-hidden="true">
    {@html svg}
  </div>

  <!-- Progress ring -->
  <svg class="ring" width="54" height="54" aria-hidden="true">
    <circle cx="27" cy="27" r={R} class="track" />
    <circle
      cx="27" cy="27" r={R}
      class="fill"
      stroke-dasharray="{dash} {CIRC}"
      stroke-dashoffset="0"
      transform="rotate(-90 27 27)"
    />
  </svg>

  <!-- Icon badge -->
  <span class="badge">{icon}</span>

  <!-- Text -->
  <div class="text">
    <span class="unit-id">{id.toUpperCase()}</span>
    <span class="name">{name}</span>
    <span class="teks">{teks}</span>
  </div>

  {#if locked}
    <span class="lock" aria-label="Locked">🔒</span>
  {/if}
</button>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 1.25rem;
    border: none;
    background: var(--color-surface, #fff);
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
    width: 100%;
  }

  .card:hover:not(.locked) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.13);
  }

  .card:active:not(.locked) {
    transform: scale(0.97);
  }

  .card.locked {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Faint color wash in the background */
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color);
    opacity: 0.07;
    border-radius: inherit;
  }

  .illustration {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 3.5rem;
    height: 3.5rem;
    opacity: 0.9;
  }

  .illustration :global(svg) {
    width: 100%;
    height: 100%;
  }

  .ring {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    opacity: 0.85;
  }

  .ring .track {
    fill: none;
    stroke: color-mix(in srgb, var(--color) 20%, transparent);
    stroke-width: 4;
  }

  .ring .fill {
    fill: none;
    stroke: var(--color);
    stroke-width: 4;
    stroke-linecap: round;
    transition: stroke-dasharray 0.4s ease;
  }

  .badge {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    position: relative;
    z-index: 1;
  }

  .unit-id {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--color);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text, #2d3436);
    line-height: 1.2;
    max-width: 10rem;
  }

  .teks {
    font-size: 0.7rem;
    color: var(--color-text-muted, #636e72);
  }

  .lock {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    font-size: 0.85rem;
  }
</style>
