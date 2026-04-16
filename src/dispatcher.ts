import { on } from "svelte/events";

// -- Matching ----------------------------------------------------------------

interface ParsedShortcut {
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	meta: boolean;
}

const ALIASES: Record<string, string> = {
	esc: "escape",
	return: "enter",
	del: "delete",
	space: " ",
	up: "arrowup",
	down: "arrowdown",
	left: "arrowleft",
	right: "arrowright",
	option: "alt",
	command: "meta",
	win: "meta",
	plus: "+",
};

const MODIFIERS = new Set(["ctrl", "shift", "alt", "meta", "cmd", "mod"]);

export const isMac =
	typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

function normalizeKey(k: string): string {
	const lower = k.toLowerCase();
	return ALIASES[lower] ?? lower;
}

function parseShortcut(input: string): ParsedShortcut {
	const parts = input.split("+").map((p) => normalizeKey(p.trim())).filter(Boolean);
	const spec: ParsedShortcut = { key: "", ctrl: false, shift: false, alt: false, meta: false };
	for (const part of parts) {
		if (!MODIFIERS.has(part)) { spec.key = part; continue; }
		if (part === "ctrl") spec.ctrl = true;
		else if (part === "shift") spec.shift = true;
		else if (part === "alt") spec.alt = true;
		else if (part === "meta" || part === "cmd") spec.meta = true;
		else if (part === "mod") { if (isMac) spec.meta = true; else spec.ctrl = true; }
	}
	return spec;
}

function parseShortcutList(input: string): ParsedShortcut[] {
	return input.trim().split(/\s+/).filter(Boolean).map(parseShortcut);
}

export function normalizeKeys(keys: string | string[]): string {
	return Array.isArray(keys) ? keys.join(" ") : keys;
}

export function matches(e: KeyboardEvent, spec: ParsedShortcut): boolean {
	return (
		normalizeKey(e.key) === spec.key &&
		e.ctrlKey === spec.ctrl &&
		e.shiftKey === spec.shift &&
		e.altKey === spec.alt &&
		e.metaKey === spec.meta
	);
}

// -- Dispatcher --------------------------------------------------------------

export interface Registration {
	shortcuts: ParsedShortcut[];
	handler: (e: KeyboardEvent) => void;
	ignoreInputs: boolean;
	ignoreRepeat: boolean;
}

type Transform = (shortcut: string) => string;

const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const registrations = new Set<Registration>();
const transforms: Transform[] = [];
let stopListener: (() => void) | null = null;

const isTyping = (e: KeyboardEvent): boolean => {
	const el = e.target as HTMLElement | null;
	return !!el && (IGNORED_TAGS.has(el.tagName) || el.isContentEditable);
};

/** Walk ancestors of e.target; ignore the event if any ancestor has data-keyshortcuts-ignore (unless that ancestor is itself focused). */
const inIgnoreZone = (e: KeyboardEvent): boolean => {
	let cur = (e.target as Element).parentElement;
	while (cur) {
		if (cur.hasAttribute("data-keyshortcuts-ignore")) return document.activeElement !== cur;
		cur = cur.parentElement;
	}
	return false;
};

const handleKeydown = (e: KeyboardEvent): void => {
	let ignoreZone: boolean | undefined;
	for (const reg of registrations) {
		if (reg.ignoreRepeat && e.repeat) continue;
		if (reg.ignoreInputs && isTyping(e)) continue;
		ignoreZone ??= inIgnoreZone(e);
		if (ignoreZone) continue;
		if (reg.shortcuts.some((s) => matches(e, s))) reg.handler(e);
	}
};

export function register(reg: Registration): () => void {
	if (registrations.size === 0) stopListener = on(window, "keydown", handleKeydown);
	registrations.add(reg);
	return () => {
		registrations.delete(reg);
		if (registrations.size === 0 && stopListener) {
			stopListener();
			stopListener = null;
		}
	};
}

export function addTransform(fn: Transform): () => void {
	transforms.push(fn);
	return () => {
		const i = transforms.indexOf(fn);
		if (i !== -1) transforms.splice(i, 1);
	};
}

export function applyTransforms(raw: string): string {
	return transforms.reduce((s, t) => t(s), raw);
}

export function parseWithTransforms(raw: string): ParsedShortcut[] {
	return parseShortcutList(applyTransforms(raw));
}
