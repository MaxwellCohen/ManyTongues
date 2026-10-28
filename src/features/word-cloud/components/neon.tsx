import type { ReactNode } from "react";
import { cn } from "#/lib/cn";

/** Big dark "screen" that hosts the cloud (Neon Night Market stage). */
export const NEON_SCREEN_CLASS =
	"relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-white/12 bg-panel shadow-[inset_0_0_120px_#9A88E612]";

/** Prompt-bar text field: translucent, mono, rounded. */
export const NEON_PROMPT_FIELD_CLASS =
	"flex min-w-0 items-center gap-3 rounded-2xl border border-white/14 bg-white/[0.045] px-4 font-mono text-sea-ink backdrop-blur-md transition-[border-color,box-shadow] focus-within:border-neon-lime/60 focus-within:shadow-glow-lime";

/** Primary action: lime with glow, Unbounded. */
export const NEON_PRIMARY_BUTTON_CLASS =
	"inline-flex items-center justify-center gap-2 rounded-2xl bg-neon-lime px-6 py-3 font-display text-sm font-extrabold tracking-wide text-night uppercase shadow-glow-lime transition-[filter,box-shadow,opacity] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-lime disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";

/** Secondary/ghost action in the neon palette. */
export const NEON_GHOST_BUTTON_CLASS =
	"inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-sea-ink-soft transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan";

/** Export/download: pink → violet gradient with glow. */
export const NEON_EXPORT_BUTTON_CLASS =
	"inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,var(--color-neon-pink),var(--color-neon-violet))] px-5 py-2.5 font-display text-xs font-extrabold tracking-wide text-white uppercase shadow-glow-pink transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-pink";

/** Small Unbounded uppercase muted heading used on side cards. */
export const NEON_CARD_HEADING_CLASS =
	"font-display text-xs font-extrabold tracking-[0.1em] text-muted-ink uppercase";

/** Plain mono text input matching the prompt bar look (smaller). */
export const NEON_TEXT_INPUT_CLASS =
	"w-full rounded-xl border border-white/14 bg-white/[0.045] px-3 py-2 font-mono text-sm text-sea-ink placeholder:text-muted-ink focus:border-neon-cyan/60 focus:outline-none focus:ring-1 focus:ring-neon-cyan/60";

/** Stacked side-panel card. */
export function NeonCard({
	title,
	action,
	children,
	className,
	as: Tag = "section",
	...rest
}: {
	title?: ReactNode;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
	as?: "section" | "aside" | "div";
	"aria-label"?: string;
}) {
	return (
		<Tag
			className={cn(
				"min-w-0 rounded-[20px] border border-white/10 bg-white/[0.025] p-[18px]",
				className,
			)}
			{...rest}
		>
			{title || action ? (
				<div className="mb-3.5 flex items-center justify-between gap-3">
					{title ? (
						<h2 className={NEON_CARD_HEADING_CLASS}>{title}</h2>
					) : (
						<span />
					)}
					{action}
				</div>
			) : null}
			{children}
		</Tag>
	);
}

/** Mono HUD footer line for the cloud screen. */
export function NeonHud({
	wordCount,
	engine,
	children,
}: {
	wordCount: number | null;
	engine: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-5 font-mono text-xs text-muted-ink sm:px-6">
			<span className="flex items-center gap-2">
				<span
					aria-hidden
					className={cn(
						"inline-block size-2 rounded-full",
						wordCount
							? "bg-neon-lime shadow-[0_0_8px_var(--color-neon-lime)]"
							: "bg-white/25",
					)}
				/>
				<span>
					{wordCount ? "LIVE" : "IDLE"}
					{wordCount != null
						? ` · ${wordCount} ${wordCount === 1 ? "word" : "words"}`
						: ""}
					{` · engine: ${engine}`}
				</span>
			</span>
			{children}
		</div>
	);
}
