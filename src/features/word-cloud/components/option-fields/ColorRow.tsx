import type { ReactNode } from "react";
import { cn } from "#/lib/cn";

type ColorRowProps = {
	children: ReactNode;
	className?: string;
};

export default function ColorRow({ children, className }: ColorRowProps) {
	return (
		<div
			className={cn(
				"relative z-10 flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-2 py-1.5 font-mono transition-colors focus-within:border-neon-cyan/60",
				className,
			)}
		>
			{children}
		</div>
	);
}
