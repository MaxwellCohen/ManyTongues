import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { cn } from "#/lib/utils";

function Input({
	ref,
	className,
	type,
	...props
}: React.ComponentProps<"input">) {
	return (
		<InputPrimitive
			ref={ref}
			type={type}
			data-slot="input"
			className={cn(
				"h-9 w-full min-w-0 rounded-2xl border border-white/15 bg-white/[0.05] px-3 py-1 font-mono text-sm text-sea-ink transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-ink focus-visible:border-neon-cyan focus-visible:ring-2 focus-visible:ring-neon-cyan/40 focus-visible:shadow-glow-cyan disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
