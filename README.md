# svelte-attach-key

A Svelte attachment for binding keyboard shortcuts to DOM elements using the [Svelte 5 attachments API](https://svelte.dev/docs/svelte/attachments).

## Example

```svelte
<script lang="ts">
  import { hotkey } from "svelte-attach-key";
</script>

<!-- Global hotkey -->
<button {@attach hotkey("l")} onclick={() => console.log("liked")}>
  Like
</button>

<!-- With modifiers -->
<button {@attach hotkey("s", { ctrl: true })} onclick={() => console.log("saved")}>
  Save
</button>

<!-- Cross-platform: Ctrl on Windows/Linux, Cmd on Mac -->
<button {@attach hotkey("z", { mod: true })} onclick={() => console.log("undo")}>
  Undo
</button>

<!-- Only works while the element is focused -->
<button {@attach hotkey("g", { global: false })} onclick={() => console.log("focused action")}>
  Focused trigger
</button>

<!-- Match the physical key instead of the typed character -->
<button {@attach hotkey("KeyW", { code: true })} onclick={() => console.log("move up")}>
  Move Up
</button>

<!-- Conditional attachment -->
<button {@attach enabled && hotkey("k")} onclick={() => console.log("pressed k")}>
  Press K
</button>
```

## Guide

Use `hotkey(key, options)` on any clickable element.

- `hotkey("l")`: trigger the element with a simple key.
- `hotkey("s", { ctrl: true })`: require modifier keys like `ctrl`, `shift`, `alt`, or `meta`.
- `hotkey("z", { mod: true })`: use `Ctrl` on Windows/Linux and `Cmd` on Mac.
- `hotkey("g", { global: false })`: listen only while the element itself is focused.
- `hotkey("KeyW", { code: true })`: match a physical keyboard key via `KeyboardEvent.code`.
- `enabled && hotkey("k")`: attach conditionally.

By default, the hotkey is global, ignores inputs/textareas/selects, and triggers the element's `click()`.

[Demo](https://joknoll.github.io/svelte-attach-key/) | [npm](https://npmx.dev/package/svelte-attach-key)
