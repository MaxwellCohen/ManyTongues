import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "#/lib/utils";

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-mono text-xs/relaxed font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-neon-cyan focus-visible:ring-2 focus-visible:ring-neon-cyan/40 focus-visible:shadow-glow-cyan active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-neon-lime text-night shadow-glow-lime hover:bg-[#C4E09C] hover:shadow-[0_0_32px_#B5D884aa]",
				outline:
					"border-white/15 bg-white/[0.04] text-sea-ink hover:border-neon-cyan/70 hover:bg-neon-cyan/10 hover:text-neon-cyan aria-expanded:border-neon-cyan aria-expanded:text-neon-cyan",
				secondary:
					"border-white/12 bg-white/[0.06] text-sea-ink hover:bg-white/[0.1] aria-expanded:bg-white/[0.1] aria-expanded:text-sea-ink",
				ghost:
					"text-sea-ink-soft hover:bg-white/[0.06] hover:text-neon-cyan aria-expanded:bg-white/[0.06] aria-expanded:text-neon-cyan",
				destructive:
					"border-neon-pink/40 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20 hover:shadow-glow-pink focus-visible:border-neon-pink focus-visible:ring-neon-pink/40",
				link: "text-neon-cyan underline-offset-4 hover:underline",
			},
			size: {
				default:
					"h-8 gap-1.5 px-3 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				xs: "h-5 gap-1 rounded-md px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
				sm: "h-7 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				lg: "h-10 gap-1.5 rounded-2xl px-4 text-sm/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
				icon: "size-8 [&_svg:not([class*='size-'])]:size-3.5",
				"icon-xs": "size-5 rounded-md [&_svg:not([class*='size-'])]:size-2.5",
				"icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3",
				"icon-lg": "size-10 rounded-2xl [&_svg:not([class*='size-'])]:size-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
