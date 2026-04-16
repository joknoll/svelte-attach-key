# svelte-attach-key

Svelte 5 attachments for wiring keyboard shortcuts to DOM elements.

## Usage

```svelte
<script lang="ts">
  import { hotkey, pressed, formatHint } from "svelte-attach-key";
</script>

<button
  {@attach hotkey("mod+k")}
  onclick={() => console.log("opened")}
>
  Open command menu
</button>
```

`hotkey("mod+k")` sets `aria-keyshortcuts="mod+k"` on the element automatically. `pressed()` reads it back to know which key to watch.

Pass alternative shortcuts as an array — either key triggers the element:

```svelte
<button
  title={formatHint(["j", "arrowdown"])}
  {@attach hotkey(["j", "arrowdown"])}
>
  Move down
</button>
```

Attach a callback instead of relying on `click`:

```svelte
<button {@attach hotkey("mod+s", (e) => save())}>Save</button>
```

Conditional attachment:

```svelte
<button {@attach enabled && hotkey("k")}>Press K</button>
```

## API

### `hotkey(keys, onTrigger?, options?)`

Triggers `onTrigger` (or `node.click()`) when a matching key is pressed. Sets `aria-keyshortcuts` on the element and restores the prior value on cleanup.

| Parameter | Type | Default |
|---|---|---|
| `keys` | `string \| string[]` | required |
| `onTrigger` | `(e: KeyboardEvent, node: HTMLElement) => void` | `node.click()` |
| `options.preventDefault` | `boolean` | `true` |
| `options.stopPropagation` | `boolean` | `false` |
| `options.ignoreInputs` | `boolean` | `true` |
| `options.ignoreRepeat` | `boolean` | `true` |

Shortcut strings: `k`, `ctrl+s`, `shift+space`, `mod+/`. `mod` resolves to `⌘` on Mac and `Ctrl` elsewhere.

### `pressed(keys?, className?)`

Adds `className` while a matching key is held, removes it on keyup. If `keys` is omitted, reads from `aria-keyshortcuts` (set by `hotkey`).

| Parameter | Type | Default |
|---|---|---|
| `keys` | `string \| string[]` | reads `aria-keyshortcuts` |
| `className` | `string` | `"is-pressed"` |

### `formatHint(keys)`

Formats a shortcut for display. `mod+s` → `⌘ S` on Mac, `Ctrl + S` on PC.

```ts
formatHint("mod+s")          // "⌘ S" / "Ctrl + S"
formatHint(["j", "down"])    // "J / Down"
```

### `addTransform(fn)`

Registers a transform applied before parsing and formatting. Returns a remover function.

```ts
const remove = addTransform((s) => s.replaceAll("primary", "mod"));
```

### `likelyWithKeyboard()`

Returns `true` when the primary pointer is not coarse (i.e. likely has a keyboard). Use to conditionally render shortcut hints.

## Notes

- Shortcuts are global by default (fire regardless of which element has focus).
- Inputs, textareas, selects, and `contenteditable` are ignored by default.
- Add `data-keyshortcuts-ignore` to a container to suppress shortcuts while focus is inside that subtree.

[Demo](https://joknoll.github.io/svelte-attach-key/) | [npm](https://npmjs.com/package/svelte-attach-key)
