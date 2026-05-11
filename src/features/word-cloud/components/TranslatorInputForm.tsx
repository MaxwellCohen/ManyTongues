import { useRef, useState } from "react";
import {
	Field,
	FieldControl,
	FieldLabel,
} from "#/components/ui/field";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { TRANSLATOR_SOURCE_LANGUAGE_OPTIONS } from "#/lib/translatorSourceLanguages";

type TranslatorInputFormProps = {
	initialInput: string;
	sourceLanguage: string;
	loading: boolean;
	error: string | null;
	translationCount: number;
	onSourceLanguageChange: (sourceLanguage: string) => void;
	onTranslate: (input: string) => void;
	onBlur: (input: string) => void;
	onRetry?: () => void;
};

export function TranslatorInputForm({
	initialInput,
	sourceLanguage,
	loading,
	error,
	translationCount,
	onSourceLanguageChange,
	onTranslate,
	onBlur,
	onRetry,
}: TranslatorInputFormProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [hasContent, setHasContent] = useState(Boolean(initialInput?.trim()));

	const handleTranslate = () => {
		const value = inputRef.current?.value ?? "";
		onTranslate(value);
	};

	const handleBlur = () => {
		const value = inputRef.current?.value ?? "";
		onBlur(value);
	};

	const handleInput = () => {
		setHasContent(Boolean(inputRef.current?.value.trim()));
	};

	return (
		<>
			<div className="mb-4">
				<Label
					htmlFor="translator-source-lang"
					className="mb-2 block text-sm font-semibold text-sea-ink"
				>
					Source language
				</Label>
				<select
					id="translator-source-lang"
					className="h-9 w-full max-w-xs rounded-md border border-line bg-surface px-3 py-1 text-sm text-sea-ink"
					value={sourceLanguage}
					disabled={loading}
					onChange={(e) => onSourceLanguageChange(e.target.value)}
				>
					{TRANSLATOR_SOURCE_LANGUAGE_OPTIONS.map(({ code, label }) => (
						<option key={code} value={code}>
							{label} ({code})
						</option>
					))}
				</select>
			</div>

			<Field id="translator-input">
				<FieldLabel className="mb-2 text-sm font-semibold text-sea-ink">
					Text to translate
				</FieldLabel>
				<FieldControl invalid={Boolean(error)}>
					<Input
						ref={inputRef}
						type="text"
						defaultValue={initialInput}
						className="h-9 px-3 py-2 text-sm"
						aria-invalid={Boolean(error)}
						onKeyDown={(e) => {
							if (e.key !== "Enter") return;
							e.preventDefault();
							handleTranslate();
						}}
						onBlur={handleBlur}
						onInput={handleInput}
						placeholder="For example: everything will be great"
					/>
				</FieldControl>
				<div role="status" aria-live="polite" className="min-h-5">
					{error ? (
						<p className="mt-1 text-sm font-medium text-red-600">{error}</p>
					) : null}
				</div>
			</Field>

			<Button
				type="button"
				onClick={handleTranslate}
				disabled={loading || !hasContent}
				className="mt-3 w-full"
			>
				{loading ? "Translating..." : "Translate phrase"}
			</Button>

			{error && onRetry && !loading ? (
				<Button
					type="button"
					variant="outline"
					onClick={onRetry}
					className="mt-2 w-full"
				>
					Retry translation
				</Button>
			) : null}

			{translationCount > 0 && !loading && (
				<p className="mt-2 text-sm text-sea-ink-soft">
					{translationCount} translation
					{translationCount !== 1 ? "s are" : " is"} ready.
				</p>
			)}
		</>
	);
}
