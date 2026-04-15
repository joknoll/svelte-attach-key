import { on } from "svelte/events";
import type { Attachment } from "svelte/attachments";

interface HotkeyModifiers {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  /** Platform-aware modifier: Ctrl on Windows/Linux, Cmd on Mac */
  mod?: boolean;
}

interface HotkeyOptions extends HotkeyModifiers {
  global?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ignoreInputs?: boolean;
  code?: boolean;
  enabled?: boolean;
}

const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

/**
 * Creates an attachment that triggers an element's click when a hotkey is pressed
 *
 * @example
 * // Simple hotkey
 * <button {@attach hotkey('k')} onclick={doSomething}>Press K</button>
 *
 * @example
 * // With modifiers
 * <button {@attach hotkey('s', { ctrl: true })} onclick={save}>Save (Ctrl+S)</button>
 *
 * @example
 * // Element-scoped (only works when focused)
 * <input {@attach hotkey('Enter', { global: false })} />
 *
 * @example
 * // Use code instead of key (useful for physical layout)
 * <button {@attach hotkey('KeyW', { code: true })} onclick={moveUp}>Move Up</button>
 *
 * @example
 * // Conditionally enabled
 * <button {@attach enabled && hotkey('k')} onclick={doSomething}>Press K</button>
 */
export function hotkey(key: string, options: HotkeyOptions = {}): Attachment<HTMLElement> {
  const {
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    mod = false,
    global: isGlobal = true,
    preventDefault = true,
    stopPropagation = false,
    ignoreInputs = true,
    code = false,
    enabled = true,
  } = options;

  return (node: HTMLElement) => {
    if (!enabled) return;

    const normalizedKey = key.toLowerCase();

    function handleKeydown(e: KeyboardEvent): void {
      const eventKey = code ? e.code : e.key;
      if (eventKey.toLowerCase() !== normalizedKey) return;

      const expectCtrl = ctrl || (mod && !isMac);
      const expectMeta = meta || (mod && isMac);

      if (e.ctrlKey !== expectCtrl) return;
      if (e.shiftKey !== shift) return;
      if (e.altKey !== alt) return;
      if (e.metaKey !== expectMeta) return;

      if (ignoreInputs) {
        const el = e.target as HTMLElement;
        if (IGNORED_TAGS.has(el.tagName) || el.isContentEditable) return;
      }

      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      node.click();
    }

    return isGlobal ? on(window, "keydown", handleKeydown) : on(node, "keydown", handleKeydown);
  };
}
