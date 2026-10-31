import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "#/lib/cn";

type LinkButtonTone = "primary" | "secondary";

type LinkButtonProps = ComponentProps<typeof Link> & {
	tone?: LinkButtonTone;
};

export default function LinkButton({
	className,
	tone,
	...props
}: LinkButtonProps) {
	const toneClassName =
		tone === "secondary"
			? "rounded-full border border-neon-cyan bg-transparent px-6 py-3 font-mono text-sm font-bold text-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-glow-cyan focus-visible:shadow-glow-cyan focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-night"
			: "gap-2 rounded-2xl border border-btn-primary-bg bg-btn-primary-bg px-7 py-3.5 font-display text-sm font-extrabold uppercase leading-5 tracking-action text-btn-primary-text shadow-button-primary transition-[background-color,border-color,box-shadow] duration-150 hover:border-btn-primary-hover-bg hover:bg-btn-primary-hover-bg hover:text-btn-primary-text hover:shadow-[0_0_36px_#B5D884bb] focus-visible:shadow-button-primary-focus";

	return (
		<Link
			{...props}
			className={cn(
				"inline-flex items-center justify-center no-underline focus:outline-none",
				toneClassName,
				className,
			)}
		/>
	);
}
