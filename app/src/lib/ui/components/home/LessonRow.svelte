<script lang="ts">
  /**
   * LessonRow — a single lesson entry in the unit detail lesson list.
   *
   * Props:
   *   icon      — emoji icon
   *   title     — lesson title
   *   desc      — short description
   *   color     — unit brand color (used for icon bg)
   *   done      — whether the lesson quiz has been passed
   *   locked    — whether the lesson is locked
   *   onSelect  — called when tapped
   */

  const { icon, title, desc, color, done = false, locked = false, onSelect }: {
    icon: string;
    title: string;
    desc: string;
    color: string;
    done?: boolean;
    locked?: boolean;
    onSelect: () => void;
  } = $props();
</script>

<button
  type="button"
  class="row"
  class:done
  class:locked
  style="--color: {color}"
  onclick={onSelect}
  aria-disabled={locked}
  aria-label="{title}{done ? ' — completed' : ''}{locked ? ' — locked' : ''}"
>
  <span class="icon-wrap">{icon}</span>

  <div class="info">
    <span class="title">{title}</span>
    <span class="desc">{desc}</span>
  </div>

  <span class="status" aria-hidden="true">
    {#if locked}🔒{:else if done}✅{:else}▶{/if}
  </span>
</button>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border-radius: 1rem;
    border: 2px solid transparent;
    background: var(--color-surface, #fff);
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, transform 0.1s;
  }

  .row:hover:not(.locked) {
    border-color: var(--color);
    transform: translateX(3px);
  }

  .row.done {
    background: color-mix(in srgb, var(--color) 6%, var(--color-surface, #fff));
  }

  .row.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-wrap {
    font-size: 1.6rem;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--color) 15%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .desc {
    font-size: 0.78rem;
    color: var(--color-text-muted, #636e72);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status {
    font-size: 1rem;
    flex-shrink: 0;
    color: var(--color-text-muted, #636e72);
  }

  .done .status {
    color: var(--color-success, #00b894);
  }
</style>
