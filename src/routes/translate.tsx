import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { startTransition,  useMemo } from "react";
import { z } from "zod";
import Accordion from "#/components/Accordion";
import IslandPanel from "#/components/IslandPanel";
import TranslationsAccordion from "#/components/TranslationsAccordion";
import PageHero from "#/components/PageHero";
import WordCloudCanvas from "#/components/WordCloudCanvas";
import WordCloudOptions from "#/components/WordCloudOptions";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
  booleanSearchParam,
  csvSearchParam,
} from "#/features/word-cloud/searchParams";
import {
  type TranslatorSearch,
  resolveTranslatorSearch,
  translatorScaleOptions,
} from "#/features/word-cloud/translateState";
import { useTranslatePage } from "#/features/word-cloud/useTranslatePage";

const translatorSearchSchema = z.object({
  input: z.string().optional(),
  translated: booleanSearchParam.optional(),
  maxWords: z.coerce.number().int().min(1).max(1000).optional(),
  minFontSize: z.coerce.number().int().min(1).max(200).optional(),
  maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
  padding: z.coerce.number().int().min(0).max(20).optional(),
  scale: z.enum(translatorScaleOptions).optional(),
  rotationMin: z.coerce.number().int().min(-360).max(360).optional(),
  rotationMax: z.coerce.number().int().min(-360).max(360).optional(),
  rotations: z.coerce.number().int().min(0).max(12).optional(),
  deterministic: booleanSearchParam.optional(),
  fontFamily: z.string().optional(),
  backgroundColor: z.string().optional(),
  colors: csvSearchParam.optional(),
  hiddenLanguages: csvSearchParam.optional(),
  weights: z.string().optional(),
});

export const Route = createFileRoute("/translate")({
  ssr: false,
  validateSearch: zodValidator(translatorSearchSchema),
  head: () => ({
    meta: [
      {
        title: "Translate | ManyTongues",
      },
    ],
  }),
  component: TranslatorWordCloudPage,
});

function TranslatorWordCloudPage() {
  const navigate = useNavigate({ from: "/translate" });
  const searchFromUrl = Route.useSearch();
  const resolvedSearch = useMemo(
    () => resolveTranslatorSearch(searchFromUrl),
    [searchFromUrl],
  );

  return (
    <>
      <PageHero
        kicker="Translate"
        title="Translate one phrase into a word cloud"
        description="Compare a short phrase across multiple languages, then adjust the cloud to highlight the translations that matter most."
      />

      <TranslatorWordCloudContent
        resolvedSearch={resolvedSearch}
        onSyncToUrl={(search) => {
          navigate({
            to: "/translate",
            search,
            replace: true,
            resetScroll: false,
          });
        }}
      />
    </>
  );
}

function TranslatorWordCloudContent({
  resolvedSearch,
  onSyncToUrl,
}: {
  resolvedSearch: ReturnType<typeof resolveTranslatorSearch>;
  onSyncToUrl: (search: Partial<TranslatorSearch>) => void;
}) {
  const {
    formState,
    send,
    updateFields,
    commitToUrl,
    loading,
    error,
    translations,
    visibleTranslations,
    weights,
    cloudData,
    hasWords,
    palette,
    cloudOptions,
  } = useTranslatePage({
    resolvedSearch,
    onSyncToUrl,
  });

  return (
    <div className="animate-rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
      <IslandPanel className="space-y-5 rounded-2xl p-5 sm:p-6">
        <Accordion title="Phrase" defaultOpen>
          <Field id="translator-input">
            <FieldLabel className="mb-2 text-sm font-semibold text-sea-ink">
              Text to translate
            </FieldLabel>
            <FieldControl invalid={Boolean(error)}>
              <Input
                type="text"
                uiSize="lg"
                value={formState.input}
                onChange={(e) => updateFields({ input: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  send({ type: "TRANSLATE_REQUESTED" });
                }}
                onBlur={commitToUrl}
                placeholder="For example: everything will be great"
              />
            </FieldControl>
            <FieldMessage role="alert">{error}</FieldMessage>
          </Field>

          <button
            type="button"
            onClick={() => send({ type: "TRANSLATE_REQUESTED" })}
            disabled={loading || !formState.input.trim()}
            className="mt-3 w-full rounded-xl bg-lagoon px-4 py-3 text-sm font-semibold text-white hover:bg-lagoon/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Translating..." : "Translate phrase"}
          </button>

          {translations.size > 0 && !loading && (
            <p className="mt-2 text-sm text-sea-ink-soft">
              {translations.size} translation
              {translations.size !== 1 ? "s are" : " is"} ready.
            </p>
          )}
        </Accordion>

        {translations.size > 0 && (
          <TranslationsAccordion
            visibleTranslations={visibleTranslations}
            weights={weights}
            onWeightChange={(lang, value) =>
              send({ type: "WEIGHT_CHANGED", lang, value })
            }
            onRemoveLanguage={(lang) =>
              startTransition(() => send({ type: "LANGUAGE_HIDDEN", lang }))
            }
            onBlur={commitToUrl}
          />
        )}
      </IslandPanel>

      <WordCloudCanvas
        words={cloudData}
        palette={palette}
        backgroundColor={formState.backgroundColor}
        mounted
        hasWords={hasWords}
        options={cloudOptions}
      >
        <Accordion title="Cloud styling" className="pt-5">
          <WordCloudOptions formState={formState} send={send} />
        </Accordion>
      </WordCloudCanvas>
    </div>
  );
}
