import { useRef } from "react";
import { CloseIcon } from "#/components/icons";
import ColorRow from "./ColorRow";
import ColorTextField from "./ColorTextField";

export default function WordCloudPaletteColorField({
	defaultValue,
	index,
	canRemove,
	onChange,
	onRemove,
	onBlur,
}: {
	defaultValue: string;
	index: number;
	canRemove: boolean;
	onChange: (value: string) => void;
	onRemove: () => void;
	onBlur: (value: string) => void;
}) {
	const pickerRef = useRef<HTMLInputElement>(null);

	const handlePickerBlur = () => {
		const value = pickerRef.current?.value;
		if (value) {
			onChange(value);
			onBlur(value);
		}
	};

	return (
		<ColorRow>
			<input
				ref={pickerRef}
				type="color"
				defaultValue={defaultValue}
				onChange={(e) => onChange(e.target.value)}
				onBlur={handlePickerBlur}
				aria-label={`Word color ${index + 1} picker`}
				className="h-8 w-8 shrink-0 cursor-pointer overflow-visible rounded-[10px] border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-[8px] [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-moz-color-swatch]:rounded-[8px] [&::-moz-color-swatch]:border-0"
			/>
			<ColorTextField
				defaultValue={defaultValue}
				onChange={(_: string) => {}}
				onBlur={(v) => {
					onBlur(v);
					onChange(v);
				}}
				ariaLabel={`Word color ${index + 1} hex value`}
				placeholder="#E879A8"
			/>
			{canRemove && (
				<button
					type="button"
					onClick={onRemove}
					className="rounded-md p-1 text-muted-ink transition-colors hover:bg-neon-pink/10 hover:text-neon-pink"
					aria-label="Remove color"
				>
					<CloseIcon className="h-3.5 w-3.5" />
				</button>
			)}
		</ColorRow>
	);
}
