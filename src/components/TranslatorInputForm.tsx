import { useRef, useState } from "react";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

type TranslatorInputFormProps = {
  initialInput: string;
  loading: boolean;
  error: string | null;
  translationCount: number;
  onTranslate: (input: string) => void;
  onBlur: (input: string) => void;
};

export function TranslatorInputForm({
  initialInput,
  loading,
  error,
  translationCount,
  onTranslate,
  onBlur,
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
      <Field id="translator-input">
        <FieldLabel className="mb-2 text-sm font-semibold text-sea-ink">
          Text to translate
        </FieldLabel>
        <FieldControl invalid={Boolean(error)}>
          <Input
            ref={inputRef}
            type="text"
            uiSize="lg"
            defaultValue={initialInput}
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
        <FieldMessage role="alert">{error}</FieldMessage>
      </Field>

      <button
        type="button"
        onClick={handleTranslate}
        disabled={loading || !hasContent}
        className="mt-3 w-full rounded-xl bg-lagoon px-4 py-3 text-sm font-semibold text-white hover:bg-lagoon/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Translating..." : "Translate phrase"}
      </button>

      {translationCount > 0 && !loading && (
        <p className="mt-2 text-sm text-sea-ink-soft">
          {translationCount} translation
          {translationCount !== 1 ? "s are" : " is"} ready.
        </p>
      )}
    </>
  );
}
