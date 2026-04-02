<script lang="ts">
  /**
   * ParentSettings — Accessibility & app settings panel.
   *
   * Writes directly to the a11y and settings persisted stores.
   * Changes are instant — no save button needed.
   */

  import { a11y, settings } from '$lib/stores';

  function toggleA11y(key: keyof typeof $a11y) {
    a11y.update(v => ({ ...v, [key]: !v[key] }));
  }

  function toggleSettings(key: keyof typeof $settings) {
    settings.update(v => ({ ...v, [key]: !v[key] }));
  }
</script>

<div class="settings-card">

  <!-- Accessibility section -->
  <div class="settings-section">
    <h3 class="settings-heading">Accessibility</h3>

    <div class="toggle-list">
      <label class="toggle-row">
        <div class="toggle-info">
          <span class="toggle-label">Colorblind Mode</span>
          <span class="toggle-desc">Uses patterns + shapes instead of color alone</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={$a11y.colorblind}
          aria-label="Toggle colorblind mode"
          class="toggle-btn"
          class:on={$a11y.colorblind}
          onclick={() => toggleA11y('colorblind')}
        >
          <span class="toggle-knob"></span>
        </button>
      </label>

      <label class="toggle-row">
        <div class="toggle-info">
          <span class="toggle-label">Haptic Feedback</span>
          <span class="toggle-desc">Vibration on correct/incorrect answers (mobile)</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={$a11y.haptic}
          aria-label="Toggle haptic feedback"
          class="toggle-btn"
          class:on={$a11y.haptic}
          onclick={() => toggleA11y('haptic')}
        >
          <span class="toggle-knob"></span>
        </button>
      </label>

      <label class="toggle-row">
        <div class="toggle-info">
          <span class="toggle-label">Reduce Motion</span>
          <span class="toggle-desc">Minimises animations and transitions</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={$a11y.reduceMotion}
          aria-label="Toggle reduce motion"
          class="toggle-btn"
          class:on={$a11y.reduceMotion}
          onclick={() => toggleA11y('reduceMotion')}
        >
          <span class="toggle-knob"></span>
        </button>
      </label>

      <label class="toggle-row">
        <div class="toggle-info">
          <span class="toggle-label">Screen Reader Mode</span>
          <span class="toggle-desc">Adds additional ARIA labels and announcements</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={$a11y.screenreader}
          aria-label="Toggle screen reader mode"
          class="toggle-btn"
          class:on={$a11y.screenreader}
          onclick={() => toggleA11y('screenreader')}
        >
          <span class="toggle-knob"></span>
        </button>
      </label>
    </div>
  </div>

  <div class="divider"></div>

  <!-- App settings section -->
  <div class="settings-section">
    <h3 class="settings-heading">Learning Mode</h3>

    <div class="toggle-list">
      <label class="toggle-row">
        <div class="toggle-info">
          <span class="toggle-label">Free Mode</span>
          <span class="toggle-desc">
            {#if $settings.freeMode}
              All lessons unlocked regardless of quiz scores
            {:else}
              Strict: lessons unlock in sequence after passing quizzes
            {/if}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={$settings.freeMode}
          aria-label="Toggle free mode"
          class="toggle-btn"
          class:on={$settings.freeMode}
          onclick={() => toggleSettings('freeMode')}
        >
          <span class="toggle-knob"></span>
        </button>
      </label>
    </div>

    {#if $settings.freeMode}
      <p class="mode-note">
        ⚠️ Free mode is on. Students can access all content without meeting score thresholds.
      </p>
    {/if}
  </div>

</div>

<style>
  .settings-card {
    background: var(--color-surface, #fff);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .settings-section {
    padding: 1rem 1.25rem;
  }

  .settings-heading {
    margin: 0 0 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-muted, #636e72);
  }

  .divider {
    height: 1px;
    background: var(--color-border, #dfe6e9);
    margin: 0 1.25rem;
  }

  /* Toggle list */
  .toggle-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border, #dfe6e9);
    cursor: pointer;
  }

  .toggle-row:last-child { border-bottom: none; }

  .toggle-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    flex: 1;
  }

  .toggle-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text, #2d3436);
  }

  .toggle-desc {
    font-size: 0.75rem;
    color: var(--color-text-muted, #636e72);
    line-height: 1.35;
  }

  /* Toggle button */
  .toggle-btn {
    width: 2.5rem;
    height: 1.4rem;
    border-radius: 1rem;
    border: none;
    background: var(--color-border, #b2bec3);
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s;
    padding: 0;
  }

  .toggle-btn.on {
    background: var(--color, #6c5ce7);
  }

  .toggle-knob {
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
    display: block;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .toggle-btn.on .toggle-knob {
    transform: translateX(1.1rem);
  }

  /* Free mode warning note */
  .mode-note {
    margin: 0.75rem 0 0;
    font-size: 0.78rem;
    color: #e17055;
    background: #fff0ed;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    line-height: 1.4;
  }
</style>
