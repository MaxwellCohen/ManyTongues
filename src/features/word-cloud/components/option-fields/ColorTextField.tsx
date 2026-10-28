import { useRef } from "react";
import { Input } from "#/components/ui/input";

export default function ColorTextField({
	defaultValue,
	onChange,
	onBlur,
	ariaLabel,
	placeholder,
}: {
	defaultValue: string;
	onChange: (value: string) => void;
	onBlur: (value: string) => void;
	ariaLabel: string;
	placeholder: string;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = () => {
		const value = inputRef.current?.value ?? "";
		onChange(value);
	};

	const handleBlur = () => {
		const value = inputRef.current?.value ?? "";
		onChange(value);
		onBlur(value);
	};

	return (
		<Input
			ref={inputRef}
			type="text"
			defaultValue={defaultValue}
			onChange={handleChange}
			onBlur={handleBlur}
			aria-label={ariaLabel}
			placeholder={placeholder}
			className="h-7 w-20 rounded-md border-0 bg-transparent px-1 py-0.5 font-mono text-xs uppercase focus-visible:border-0 focus-visible:shadow-none focus-visible:ring-1"
		/>
	);
}
