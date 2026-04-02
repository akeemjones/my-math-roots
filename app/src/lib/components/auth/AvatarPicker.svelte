<script lang="ts">
  /**
   * AvatarPicker — emoji avatar grid for new student profile creation.
   *
   * Props:
   *   value    — currently selected avatar emoji
   *   onChange — called with the newly selected emoji
   */

  const AVATARS = [
    '🦁','🐯','🐻','🐼','🐨','🦊','🐸','🐧',
    '🦋','🐢','🦄','🐙','🦖','🐬','🦁','🐝',
    '🌻','⭐','🌈','🚀','🎨','🎵','🏆','💎',
  ];

  const { value, onChange }: {
    value: string;
    onChange: (avatar: string) => void;
  } = $props();
</script>

<div class="picker" role="group" aria-label="Choose an avatar">
  {#each AVATARS as emoji}
    <button
      type="button"
      class="avatar-btn"
      class:selected={emoji === value}
      onclick={() => onChange(emoji)}
      aria-label={emoji}
      aria-pressed={emoji === value}
    >
      {emoji}
    </button>
  {/each}
</div>

<style>
  .picker {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }

  .avatar-btn {
    font-size: 1.6rem;
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    border: 2px solid transparent;
    background: var(--color-surface-alt, #f8f9fa);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
  }

  .avatar-btn:hover {
    background: var(--color-primary-light, #e8e3ff);
    transform: scale(1.08);
  }

  .avatar-btn.selected {
    border-color: var(--color-primary, #6c5ce7);
    background: color-mix(in srgb, var(--color-primary, #6c5ce7) 15%, transparent);
  }
</style>
