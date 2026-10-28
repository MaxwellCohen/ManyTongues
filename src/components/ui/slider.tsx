import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import * as React from "react";

import { cn } from "#/lib/utils";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: SliderPrimitive.Root.Props) {
	const _values = React.useMemo(
		() =>
			Array.isArray(value)
				? value
				: Array.isArray(defaultValue)
					? defaultValue
					: [min, max],
		[value, defaultValue, min, max],
	);

	return (
		<SliderPrimitive.Root
			className={cn("data-horizontal:w-full data-vertical:h-full", className)}
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			thumbAlignment="edge"
			{...props}
		>
			<SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
				<SliderPrimitive.Track
					data-slot="slider-track"
					className="relative grow overflow-hidden rounded-full bg-white/[0.08] select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
				>
					<SliderPrimitive.Indicator
						data-slot="slider-range"
						className="rounded-full bg-neon-pink shadow-[0_0_12px_var(--color-neon-pink)] select-none data-horizontal:h-full data-vertical:w-full"
					/>
				</SliderPrimitive.Track>
				{Array.from({ length: _values.length }, (_, index) => (
					<SliderPrimitive.Thumb
						// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional
						key={index}
						data-slot="slider-thumb"
						className="block size-4 shrink-0 rounded-full border-2 border-neon-pink bg-night shadow-[0_0_10px_var(--color-neon-pink)] ring-neon-pink/30 transition-colors select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
					/>
				))}
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	);
}

export { Slider };
