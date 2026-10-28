import type * as React from "react";

import { cn } from "#/lib/utils";

function Textarea({
	ref,
	className,
	...props
}: React.ComponentProps<"textarea">) {
	return (
		<textarea
			ref={ref}
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-3 py-2.5 font-mono text-sm leading-relaxed text-sea-ink transition-colors outline-none placeholder:text-muted-ink focus-visible:border-neon-cyan focus-visible:ring-2 focus-visible:ring-neon-cyan/40 focus-visible:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
