import { useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Field, FieldControl, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	NEON_PRIMARY_BUTTON_CLASS,
	NEON_PROMPT_FIELD_CLASS,
} from "#/features/word-cloud/components/neon";
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
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
				<div className={`${NEON_PROMPT_FIELD_CLASS} sm:w-auto sm:max-w-48`}>
					<Label htmlFor="translator-source-lang" className="sr-only">
						Source language
					</Label>
					<select
						id="translator-source-lang"
						className="h-12 w-full min-w-0 cursor-pointer appearance-none bg-transparent font-mono text-sm text-sea-ink outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-panel"
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
					<span aria-hidden className="text-xs text-muted-ink">
						▾
					</span>
				</div>

				<Field id="translator-input" className="min-w-0 flex-1">
					<FieldLabel className="sr-only">Text to translate</FieldLabel>
					<div
						className={`${NEON_PROMPT_FIELD_CLASS} h-full ${
							error ? "border-neon-pink/60" : ""
						}`}
					>
						<span aria-hidden className="text-lg text-neon-lime">
							&gt;
						</span>
						<FieldControl invalid={Boolean(error)}>
							<Input
								ref={inputRef}
								type="text"
								defaultValue={initialInput}
								className="h-12 rounded-none border-0 bg-transparent px-0 text-base focus-visible:border-0 focus-visible:shadow-none focus-visible:ring-0"
								aria-invalid={Boolean(error)}
								onKeyDown={(e) => {
									if (e.key !== "Enter") return;
									e.preventDefault();
									handleTranslate();
								}}
								onBlur={handleBlur}
								onInput={handleInput}
								placeholder="everything will be great"
							/>
						</FieldControl>
					</div>
				</Field>

				<Button
					type="button"
					onClick={handleTranslate}
					disabled={loading || !hasContent}
					className={`h-12 sm:h-auto ${NEON_PRIMARY_BUTTON_CLASS}`}
				>
					{loading ? "Translating..." : "Translate phrase"}
				</Button>
			</div>

			<div
				role="status"
				aria-live="polite"
				className="flex min-h-5 flex-wrap items-center gap-x-4 gap-y-2 px-1 font-mono text-xs"
			>
				{error ? <p className="font-medium text-neon-pink">! {error}</p> : null}
				{translationCount > 0 && !loading ? (
					<p className="text-muted-ink">
						<span className="text-neon-lime">●</span> {translationCount}{" "}
						translation
						{translationCount !== 1 ? "s are" : " is"} ready.
					</p>
				) : null}
				{error && onRetry && !loading ? (
					<Button type="button" variant="outline" size="sm" onClick={onRetry}>
						Retry translation
					</Button>
				) : null}
			</div>
		</div>
	);
}
