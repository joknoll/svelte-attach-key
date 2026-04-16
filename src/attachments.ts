import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";
import { register, parseWithTransforms, matches, normalizeKeys } from "./dispatcher.ts";

export interface HotkeyOptions {
	preventDefault?: boolean;
	stopPropagation?: boolean;
	ignoreInputs?: boolean;
	ignoreRepeat?: boolean;
}

export type HotkeyTrigger = (e: KeyboardEvent, node: HTMLElement) => void;

/**
 * Attachment that fires `onTrigger` (or `node.click()`) when one of `keys` is pressed.
 * Sets `aria-keyshortcuts` on the element and restores the prior value on cleanup.
 *
 * @example
 * ```svelte
 * <button {@attach hotkey("mod+s", save)}>Save</button>
 * ```
 */
export function hotkey(
	keys: string | string[],
	onTrigger?: HotkeyTrigger,
	options?: HotkeyOptions,
): Attachment<HTMLElement> {
	return (node: HTMLElement) => {
		const {
			preventDefault = true,
			stopPropagation = false,
			ignoreInputs = true,
			ignoreRepeat = true,
		} = options ?? {};

		const raw = normalizeKeys(keys);
		const prevAria = node.getAttribute("aria-keyshortcuts");
		node.setAttribute("aria-keyshortcuts", raw);

		const unregister = register({
			shortcuts: parseWithTransforms(raw),
			handler: (e: KeyboardEvent) => {
				if (preventDefault) e.preventDefault();
				if (stopPropagation) e.stopPropagation();
				if (onTrigger) onTrigger(e, node);
				else node.click();
			},
			ignoreInputs,
			ignoreRepeat,
		});

		return () => {
			unregister();
			if (prevAria === null) node.removeAttribute("aria-keyshortcuts");
			else node.setAttribute("aria-keyshortcuts", prevAria);
		};
	};
}

/**
 * Attachment that adds `className` while one of `keys` is held, removes it on keyup.
 * If `keys` is omitted, reads the shortcut from `aria-keyshortcuts` (set by `hotkey`).
 *
 * @example
 * ```svelte
 * <button {@attach hotkey("mod+s", save)} {@attach pressed("mod+s")}>Save</button>
 * ```
 */
export function pressed(
	keys?: string | string[],
	className = "is-pressed",
): Attachment<HTMLElement> {
	return (node: HTMLElement) => {
		const raw =
			keys !== undefined ? normalizeKeys(keys) : (node.getAttribute("aria-keyshortcuts") ?? "");

		if (!raw) return;

		const shortcuts = parseWithTransforms(raw);
		let active = false;

		const clear = () => {
			active = false;
			node.classList.remove(className);
		};

		const offDown = register({
			shortcuts,
			handler: () => { active = true; node.classList.add(className); },
			ignoreInputs: true,
			ignoreRepeat: true,
		});

		const offUp = on(window, "keyup", (e: KeyboardEvent) => {
			if (active && shortcuts.some((s) => matches(e, s))) clear();
		});

		const offBlur = on(window, "blur", clear);

		return () => { offDown(); offUp(); offBlur(); clear(); };
	};
}
