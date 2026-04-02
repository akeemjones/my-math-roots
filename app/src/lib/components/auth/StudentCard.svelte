<script lang="ts">
  /**
   * StudentCard — tappable card for a student on the selection screen.
   *
   * Props:
   *   name     — student display name
   *   avatar   — emoji avatar character
   *   color    — brand hex color for the card accent
   *   selected — highlights the card when true
   *   onSelect — called when the card is tapped
   */

  const { name, avatar, color, selected = false, onSelect }: {
    name: string;
    avatar: string;
    color: string;
    selected?: boolean;
    onSelect: () => void;
  } = $props();
</script>

<button
  type="button"
  class="card"
  class:selected
  style="--accent: {color}"
  onclick={onSelect}
  aria-pressed={selected}
  aria-label="Select {name}"
>
  <span class="avatar">{avatar}</span>
  <span class="name">{name}</span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1rem;
    border-radius: 1.25rem;
    border: 3px solid transparent;
    background: var(--color-surface, #fff);
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    min-width: 7rem;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }

  .card.selected {
    border-color: var(--accent, #6c5ce7);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent, #6c5ce7) 20%, transparent);
  }

  .avatar {
    font-size: 2.75rem;
    line-height: 1;
    /* Circular avatar background using the student accent color */
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent, #6c5ce7) 15%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
    max-width: 7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
