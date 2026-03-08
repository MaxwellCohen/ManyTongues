import { useMachine } from "@xstate/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Accordion from "#/components/Accordion";
import IslandPanel from "#/components/IslandPanel";
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
import { RangeInput } from "#/components/ui/range-input";
import { createTranslateMachine } from "#/features/word-cloud/translateMachine";
import {
  booleanSearchParam,
  csvSearchParam,
} from "#/features/word-cloud/searchParams";
import {
  clampWeight,
  DEFAULT_WEIGHT,
  getTranslatorPalette,
  parseWeights,
  resolveTranslatorSearch,
  translatorScaleOptions,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from "#/features/word-cloud/translateState";
import { createXStateFormControls } from "#/lib/xstateForm";
import { getOrTranslatePhrase } from "#/lib/translate";

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
  const [machine] = useState(() =>
    createTranslateMachine({
      initialSearch: resolvedSearch,
      translatePhrase: async (phrase) =>
        getOrTranslatePhrase({ data: { phrase } }),
    }),
  );
  const [snapshot, send] = useMachine(machine);
  const formState = snapshot.context.formState;
  const { updateFields, commitToUrl } =
    createXStateFormControls<typeof formState>(send);

  useEffect(() => {
    send({ type: "URL_CHANGED", search: resolvedSearch });
  }, [resolvedSearch, send]);

  useEffect(() => {
    const pendingUrlSearch = snapshot.context.pendingUrlSearch;
    if (!pendingUrlSearch) return;

    navigate({
      to: "/translate",
      search: pendingUrlSearch,
      replace: true,
      resetScroll: false,
    });
    send({ type: "URL_COMMITTED" });
  }, [navigate, send, snapshot.context.pendingUrlSearch]);

  const hiddenLanguages = useMemo(
    () => new Set(formState.hiddenLanguages),
    [formState.hiddenLanguages],
  );
  const weights = useMemo(
    () => parseWeights(formState.weights),
    [formState.weights],
  );

  const translations = snapshot.context.translations;
  const loading = snapshot.matches("translating");
  const error = snapshot.context.error;
  const visibleTranslations = useMemo(
    () =>
      Array.from(translations.entries()).filter(
        ([lang]) => !hiddenLanguages.has(lang),
      ),
    [translations, hiddenLanguages],
  );

  const cloudDataRaw = useMemo(() => {
    const phrase = formState.input.trim();
    if (!formState.translated || (!phrase && translations.size === 0))
      return [];

    const items: { text: string; value: number }[] = [];
    if (phrase) {
      items.push({ text: phrase, value: 1000 });
    }
    translations.forEach((translatedText, lang) => {
      if (hiddenLanguages.has(lang)) return;
      const weight = weights.get(lang) ?? DEFAULT_WEIGHT;
      items.push({ text: translatedText, value: clampWeight(weight) });
    });
    return items;
  }, [
    formState.input,
    formState.translated,
    translations,
    hiddenLanguages,
    weights,
  ]);

  const cloudData = formState.translated ? cloudDataRaw : [];

  const hasWords = cloudData.length > 0;

  const palette = useMemo(
    () => getTranslatorPalette(formState.colors),
    [formState.colors],
  );
  const rotationAngles = useMemo(
    () => [formState.rotationMin, formState.rotationMax] as [number, number],
    [formState.rotationMin, formState.rotationMax],
  );

  const cloudOptions = {
    minFontSize: formState.minFontSize,
    maxFontSize: formState.maxFontSize,
    padding: formState.padding,
    scale: formState.scale,
    rotationAngles,
    rotations: formState.rotations,
    deterministic: formState.deterministic,
    fontFamily: formState.fontFamily,
    randomSeed: "translator",
  };

  return (
    <>
      <PageHero
        kicker="Translate"
        title="Translate one phrase into a word cloud"
        description="Compare a short phrase across multiple languages, then adjust the cloud to highlight the translations that matter most."
      />

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
            <Accordion title="Translations" defaultOpen={false}>
              <p className="mb-3 text-sm text-sea-ink-soft">
                Remove languages or adjust the weight to control how large each
                translation appears in the cloud.
              </p>
              <ul className="space-y-3">
                {visibleTranslations.map(([lang, text]) => (
                  <li
                    key={lang}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-foam p-3"
                  >
                    <span className="min-w-10 rounded bg-line/30 px-2 py-0.5 font-mono text-xs font-medium text-sea-ink">
                      {lang}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-sm text-sea-ink"
                      title={text}
                    >
                      {text}
                    </span>
                    <label className="flex items-center gap-1.5 text-sm text-sea-ink">
                      <span className="sr-only">Weight for {lang}</span>
                      <RangeInput
                        min={WEIGHT_MIN}
                        max={WEIGHT_MAX}
                        value={weights.get(lang) ?? DEFAULT_WEIGHT}
                        onChange={(e) => {
                          send({
                            type: "WEIGHT_CHANGED",
                            lang,
                            value: Number(e.target.value),
                          });
                        }}
                        onBlur={commitToUrl}
                        className="w-24"
                      />
                      <span className="w-8 tabular-nums">
                        {weights.get(lang) ?? DEFAULT_WEIGHT}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        send({
                          type: "LANGUAGE_HIDDEN",
                          lang,
                        })
                      }
                      className="rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-sea-ink hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </Accordion>
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
    </>
  );
}
