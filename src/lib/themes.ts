import themesHref from "../themes.css?url";

/** Theme ids match the `[data-theme="…"]` blocks in `src/themes.css`. */
export const THEMES = [
	{ id: "neon", label: "Neon Night" },
	{ id: "newsprint", label: "Newsprint" },
	{ id: "brutalist", label: "Brutalist" },
	{ id: "terminal", label: "Phosphor" },
	{ id: "blueprint", label: "Blueprint" },
	{ id: "vapor", label: "Vaporwave" },
	{ id: "bubblegum", label: "Bubblegum" },
	{ id: "desktop95", label: "Desktop 95" },
	{ id: "mesa", label: "Mesa" },
	{ id: "gilded", label: "Gilded" },
	{ id: "mosswood", label: "Mosswood" },
	{ id: "abyss", label: "Glass Abyss" },
	{ id: "comic", label: "Comic" },
	{ id: "chalkboard", label: "Chalkboard" },
	{ id: "pocket", label: "Pocket LCD" },
	{ id: "magma", label: "Magma" },
	{ id: "swiss", label: "Swiss" },
	{ id: "contrast", label: "High Contrast" },
	{ id: "velvet", label: "Velvet" },
	{ id: "aqua", label: "Aqua" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

/** The default theme is the absence of a `data-theme` attribute. */
export const DEFAULT_THEME: ThemeId = "neon";

const STORAGE_KEY = "manytongues-theme";

/** Stylesheet holding every non-default theme; kept out of the inlined app CSS. */
export const THEMES_HREF = themesHref;

/**
 * Runs in <head> before first paint. With a saved theme it sets the attribute
 * and writes a parser-blocking stylesheet link, so the default never flashes.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t){document.documentElement.dataset.theme=t;document.write('<link rel="stylesheet" href="${themesHref}">')}}catch(e){}`;

const listeners = new Set<() => void>();

export function isThemeId(value: unknown): value is ThemeId {
	return THEMES.some((theme) => theme.id === value);
}

export function subscribeTheme(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function getTheme(): ThemeId {
	const current = document.documentElement.dataset.theme;
	return isThemeId(current) ? current : DEFAULT_THEME;
}

export function setTheme(theme: ThemeId) {
	const root = document.documentElement;
	try {
		if (theme === DEFAULT_THEME) {
			delete root.dataset.theme;
			localStorage.removeItem(STORAGE_KEY);
		} else {
			root.dataset.theme = theme;
			localStorage.setItem(STORAGE_KEY, theme);
		}
	} catch {
		// Storage can be blocked; the theme still applies for this page view.
	}
	for (const listener of listeners) listener();
}
