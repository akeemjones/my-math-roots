<script lang="ts">
  /**
   * PinKeypad — 4-digit PIN entry with visual dot indicators.
   *
   * Props:
   *   onSubmit(pin: string) — called when 4 digits are entered
   *   onCancel()            — called when the × button is pressed
   *   disabled              — disables all keys (e.g. during network call)
   *   error                 — error message to display below the dots
   */

  const { onSubmit, onCancel, disabled = false, error = '' }: {
    onSubmit: (pin: string) => void;
    onCancel: () => void;
    disabled?: boolean;
    error?: string;
  } = $props();

  let digits = $state<string[]>([]);

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  function press(key: string) {
    if (disabled) return;
    if (key === '⌫') {
      digits = digits.slice(0, -1);
      return;
    }
    if (key === '') return;
    if (digits.length >= 4) return;
    const next = [...digits, key];
    digits = next;
    if (next.length === 4) {
      onSubmit(next.join(''));
      // Reset after a short delay so the user sees all 4 dots before clearing
      setTimeout(() => { digits = []; }, 400);
    }
  }
</script>

<div class="keypad" class:disabled>
  <!-- Dot indicators -->
  <div class="dots" role="status" aria-label="PIN entry: {digits.length} of 4 digits entered">
    {#each [0,1,2,3] as i}
      <span class="dot" class:filled={i < digits.length}></span>
    {/each}
  </div>

  {#if error}
    <p class="error" role="alert">{error}</p>
  {/if}

  <!-- Numpad grid -->
  <div class="grid">
    {#each keys as key}
      {#if key === ''}
        <!-- Cancel button in the bottom-left slot -->
        <button
          type="button"
          class="key cancel"
          onclick={onCancel}
          disabled={disabled}
          aria-label="Cancel"
        >×</button>
      {:else}
        <button
          type="button"
          class="key"
          class:backspace={key === '⌫'}
          onclick={() => press(key)}
          disabled={disabled}
          aria-label={key === '⌫' ? 'Delete' : key}
        >{key}</button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .keypad {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    user-select: none;
  }

  .dots {
    display: flex;
    gap: 1rem;
  }

  .dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid var(--color-primary, #6c5ce7);
    background: transparent;
    transition: background 0.15s;
  }

  .dot.filled {
    background: var(--color-primary, #6c5ce7);
  }

  .error {
    font-size: 0.85rem;
    color: var(--color-error, #d63031);
    text-align: center;
    margin: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 4rem);
    gap: 0.75rem;
  }

  .key {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    border: 2px solid var(--color-border, #dfe6e9);
    background: var(--color-surface, #fff);
    font-size: 1.4rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.1s, transform 0.1s;
  }

  .key:active:not(:disabled) {
    background: var(--color-primary-light, #e8e3ff);
    transform: scale(0.93);
  }

  .key:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .key.cancel {
    color: var(--color-text-muted, #636e72);
    font-size: 1.8rem;
    font-weight: 400;
  }

  .key.backspace {
    font-size: 1.1rem;
  }

  .disabled .key {
    opacity: 0.45;
    cursor: not-allowed;
  }
</style>
