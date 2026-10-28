import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "#/lib/cn";

type IslandPanelProps = {
	children: ReactNode;
	className?: string;
} & ComponentPropsWithoutRef<"section">;

export default function IslandPanel({
	children,
	className,
	...props
}: IslandPanelProps) {
	return (
		<section
			{...props}
			className={cn(
				"rounded-[28px] border border-line bg-panel/90 shadow-island backdrop-blur-xs transition-[background-color,color,border-color,box-shadow] duration-150",
				className,
			)}
		>
			{children}
		</section>
	);
}
