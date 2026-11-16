import { Popover } from "@base-ui/react/popover";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { PaletteIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
	DEFAULT_THEME,
	getTheme,
	isThemeId,
	setTheme,
	subscribeTheme,
	THEMES,
	THEMES_HREF,
} from "#/lib/themes";

const SWATCH_DOTS = [
	"bg-neon-pink",
	"bg-neon-cyan",
	"bg-neon-lime",
	"bg-neon-violet",
] as const;

/** Each swatch carries its own `data-theme`, so it renders in that theme's tokens. */
const SWATCH_STYLE = {
	backgroundImage: "var(--page-bg)",
	backgroundSize: "var(--page-bg-size)",
};

export default function ThemeSwitcher() {
	const theme = useSyncExternalStore(
		subscribeTheme,
		getTheme,
		() => DEFAULT_THEME,
	);
	const [opened, setOpened] = useState(false);

	return (
		<Popover.Root onOpenChange={(open) => open && setOpened(true)}>
			{opened || theme !== DEFAULT_THEME ? (
				<link rel="stylesheet" href={THEMES_HREF} precedence="default" />
			) : null}
			<Popover.Trigger
				aria-label="Change theme"
				className="ui-btn -my-1 inline-flex size-9 items-center justify-center gap-1.5 rounded-full border border-tint/10 font-mono md:my-0 md:size-auto md:px-3.5 md:py-2 text-nav-ink transition-[background-color,color,border-color,box-shadow] duration-150 hover:border-neon-cyan/60 hover:text-neon-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan data-popup-open:border-neon-cyan/60 data-popup-open:text-neon-cyan"
			>
				<PaletteIcon aria-hidden className="size-4 md:size-3.5" />
				<span className="max-md:hidden">theme</span>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner
					side="bottom"
					align="end"
					sideOffset={10}
					className="isolate z-101"
				>
					<Popover.Popup className="max-h-(--available-height) w-[min(34rem,calc(100vw-1.5rem))] origin-(--transform-origin) overflow-y-auto rounded-2xl border border-tint/15 bg-panel p-3 text-sea-ink shadow-[0_20px_48px_rgba(0,0,0,0.5)] outline-none">
						<Popover.Title className="mb-2.5 px-1 font-display text-xs font-extrabold tracking-[0.1em] text-muted-ink uppercase">
							Theme
						</Popover.Title>
						<RadioGroup
							aria-label="Theme"
							value={theme}
							onValueChange={(value) => {
								if (isThemeId(value)) setTheme(value);
							}}
							className="grid grid-cols-2 gap-2.5 p-1 sm:grid-cols-4"
						>
							{THEMES.map(({ id, label }) => (
								<Radio.Root
									key={id}
									value={id}
									className="cursor-pointer rounded-xl ring-offset-2 ring-offset-panel outline-none focus-visible:ring-2 focus-visible:ring-sea-ink data-checked:ring-2 data-checked:ring-neon-cyan"
								>
									<span
										data-theme={id}
										style={SWATCH_STYLE}
										className="flex h-full flex-col gap-2 rounded-xl border border-line bg-night px-2.5 py-2 font-sans text-sea-ink"
									>
										<span className="truncate font-display text-[11px] leading-tight font-extrabold">
											{label}
										</span>
										<span aria-hidden className="flex gap-1">
											{SWATCH_DOTS.map((dot) => (
												<span
													key={dot}
													className={`size-2.5 rounded-full ${dot}`}
												/>
											))}
										</span>
									</span>
								</Radio.Root>
							))}
						</RadioGroup>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
