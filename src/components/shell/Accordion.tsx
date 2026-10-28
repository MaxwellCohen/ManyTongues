import type { DetailsHTMLAttributes } from "react";
import { ChevronDownIcon } from "#/components/icons";
import { cn } from "#/lib/cn";

export default function Accordion({
	title,
	defaultOpen = false,
	children,
	...props
}: DetailsHTMLAttributes<HTMLDetailsElement> & {
	title: React.ReactNode;
	defaultOpen?: boolean;
}) {
	return (
		<details
			{...props}
			className={cn(
				"group overflow-hidden rounded-2xl border border-line bg-white/[0.03] transition-[border-color,box-shadow] duration-150 open:border-neon-violet/40",
				props.className,
			)}
			open={defaultOpen}
		>
			<summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-display text-xs font-extrabold tracking-[0.1em] text-muted-ink uppercase hover:bg-white/[0.04] hover:text-sea-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neon-cyan [&::-webkit-details-marker]:hidden">
				<span>{title}</span>
				<ChevronDownIcon className="h-4 w-4 shrink-0 text-neon-cyan transition-transform group-open:rotate-180" />
			</summary>
			<div className="border-t border-dashed border-white/10 px-4 py-3">
				{children}
			</div>
		</details>
	);
}
