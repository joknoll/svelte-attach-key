<script lang="ts">
  import { hotkey } from "svelte-attach-key";

  let saveCount = $state(0);
  let undoCount = $state(0);
  let likeCount = $state(0);
  let searchCount = $state(0);
  let enabled = $state(true);
  let lastKey = $state<string | null>(null);

  function flash(key: string) {
    lastKey = key;
    setTimeout(() => (lastKey = null), 1000);
  }
</script>

<main>
  <h1>svelte-attach-key</h1>
  <p class="subtitle">Hotkey attachments for Svelte 5 elements</p>

  <div class="grid">
    <!-- Simple key -->
    <div class="card">
      <h2>Simple key</h2>
      <p>Press <kbd>L</kbd> anywhere to like</p>
      <button
        {@attach hotkey("l")}
        onclick={() => { likeCount++; flash("L"); }}
        class:flash={lastKey === "L"}
      >
        ♥ Like ({likeCount})
      </button>
      <code>hotkey('l')</code>
    </div>

    <!-- Modifier keys -->
    <div class="card">
      <h2>Modifier keys</h2>
      <p>Press <kbd>Ctrl</kbd>+<kbd>S</kbd> to save</p>
      <button
        {@attach hotkey("s", { ctrl: true })}
        onclick={() => { saveCount++; flash("Ctrl+S"); }}
        class:flash={lastKey === "Ctrl+S"}
      >
        Save ({saveCount})
      </button>
      <code>hotkey('s', &#123; ctrl: true &#125;)</code>
    </div>

    <!-- Cross-platform mod -->
    <div class="card">
      <h2>Cross-platform mod</h2>
      <p>Press <kbd>Mod</kbd>+<kbd>Z</kbd> (Ctrl on Windows/Linux, ⌘ on Mac)</p>
      <button
        {@attach hotkey("z", { mod: true })}
        onclick={() => { undoCount++; flash("Mod+Z"); }}
        class:flash={lastKey === "Mod+Z"}
      >
        Undo ({undoCount})
      </button>
      <code>hotkey('z', &#123; mod: true &#125;)</code>
    </div>

    <!-- Element-scoped -->
    <div class="card">
      <h2>Element-scoped</h2>
      <p><kbd>Tab</kbd> to focus the button, then press <kbd>G</kbd></p>
      <p class="hint">Pressing <kbd>G</kbd> without focus does nothing</p>
      <button
        {@attach hotkey("g", { global: false })}
        onclick={() => { searchCount++; flash("G"); }}
        class:flash={lastKey === "G"}
      >
        Focused trigger ({searchCount})
      </button>
      <code>hotkey('g', &#123; global: false &#125;)</code>
    </div>

    <!-- Toggle enabled -->
    <div class="card">
      <h2>Conditional</h2>
      <p>Press <kbd>K</kbd> — toggle to enable/disable</p>
      <label class="toggle">
        <input type="checkbox" bind:checked={enabled} />
        Hotkey {enabled ? "enabled" : "disabled"}
      </label>
      <button
        {@attach enabled && hotkey("k")}
        onclick={() => flash("K")}
        class:flash={lastKey === "K"}
        class:dim={!enabled}
      >
        Press K
      </button>
      <code>&#123;@attach enabled && hotkey('k')&#125;</code>
    </div>

    <!-- Physical key code -->
    <div class="card">
      <h2>Physical key (code)</h2>
      <p>Press <kbd>W</kbd> regardless of keyboard layout</p>
      <button
        {@attach hotkey("KeyW", { code: true })}
        onclick={() => flash("KeyW")}
        class:flash={lastKey === "KeyW"}
      >
        Move Up
      </button>
      <code>hotkey('KeyW', &#123; code: true &#125;)</code>
    </div>
  </div>

  {#if lastKey}
    <div class="toast">Triggered: {lastKey}</div>
  {/if}
</main>

<style>
  main {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    font-size: 2rem;
    margin: 0;
  }

  .subtitle {
    color: #666;
    margin-top: 0.25rem;
    margin-bottom: 2rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }

  .card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h2 {
    font-size: 1rem;
    margin: 0;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #444;
  }

  kbd {
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.8em;
    font-family: monospace;
  }

  button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.15s;
    align-self: flex-start;
  }

  button:hover {
    background: #f5f5f5;
  }

  button.flash {
    background: #d4edda;
    border-color: #28a745;
  }

  button.dim {
    opacity: 0.4;
  }

  code {
    font-size: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    color: #333;
    margin-top: auto;
  }

  .hint {
    font-style: italic;
    color: #999;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    padding: 0.5rem 1.25rem;
    border-radius: 999px;
    font-size: 0.875rem;
    pointer-events: none;
  }
</style>
