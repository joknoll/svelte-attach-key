import { isMac, normalizeKeys, parseWithTransforms } from "./dispatcher.ts";

const MOD_LABELS: Record<string, [mac: string, pc: string]> = {
	ctrl:  ["⌃", "Ctrl"],
	shift: ["⇧", "Shift"],
	alt:   ["⌥", "Alt"],
	meta:  ["⌘", "Win"],
};

const KEY_LABELS: Record<string, string> = {
	" ": "Space",
	arrowup: "Up",
	arrowdown: "Down",
	arrowleft: "Left",
	arrowright: "Right",
	escape: "Esc",
	enter: "Enter",
	delete: "Delete",
	backspace: "Backspace",
	tab: "Tab",
	home: "Home",
	end: "End",
	pageup: "PageUp",
	pagedown: "PageDown",
};

const coarsePointer =
	typeof window !== "undefined" ? matchMedia("(pointer: coarse)") : null;

/**
 * Format a shortcut string (or array of alternatives) into a human-readable hint.
 *
 * @example
 * formatHint("mod+s")         // → "⌘ S" on Mac, "Ctrl + S" on PC
 * formatHint(["j", "down"])   // → "J / Down"
 */
export function formatHint(shortcut: string | string[]): string {
	return parseWithTransforms(normalizeKeys(shortcut))
		.map((combo) => {
			const parts: string[] = [];
			for (const mod of ["ctrl", "shift", "alt", "meta"] as const) {
				if (combo[mod]) parts.push(MOD_LABELS[mod][isMac ? 0 : 1]);
			}
			const key = combo.key;
			parts.push(KEY_LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key));
			return parts.join(isMac ? " " : " + ");
		})
		.join(" / ");
}

/** Returns true when the primary pointing device is likely a mouse/trackpad (not touch-only). SSR-safe. */
export function likelyWithKeyboard(): boolean {
	return coarsePointer ? !coarsePointer.matches : false;
}
