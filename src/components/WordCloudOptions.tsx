import WordCloudOptionCheckboxField from "#/components/word-cloud-options/WordCloudOptionCheckboxField";
import WordCloudOptionColorField from "#/components/word-cloud-options/WordCloudOptionColorField";
import WordCloudOptionNumberField from "#/components/word-cloud-options/WordCloudOptionNumberField";
import WordCloudOptionPaletteField from "#/components/word-cloud-options/WordCloudOptionPaletteField";
import WordCloudOptionSelectField from "#/components/word-cloud-options/WordCloudOptionSelectField";
import {
  FONT_FAMILY_OPTIONS,
  SCALE_OPTIONS,
  type ScaleType,
} from "#/lib/wordCloudUtils";
import {
  createXStateFormControls,
  type XStateFormSender,
} from "#/lib/xstateForm";

export type WordCloudOptionFields = {
  maxWords: number;
  padding: number;
  minFontSize: number;
  maxFontSize: number;
  scale: ScaleType;
  rotationMin: number;
  rotationMax: number;
  rotations: number;
  deterministic: boolean;
  fontFamily: string;
  backgroundColor: string;
  colors: string[];
};

const clampRotation = (n: number) =>
  Math.min(360, Math.max(-360, Number(n) || 0));

export default function WordCloudOptions({
  formState,
  send,
}: {
  formState: WordCloudOptionFields;
  send: XStateFormSender<WordCloudOptionFields>;
}) {
  const { updateFields, commitToUrl } = createXStateFormControls<WordCloudOptionFields>(send);

  return (
    <div
      className="grid gap-3 pt-1 sm:grid-cols-2"
    >
      <WordCloudOptionNumberField
        label="Max words"
        min={5}
        max={1000}
        defaultValue={formState.maxWords}
        onChange={(value) => updateFields({ maxWords: value })}
        onBlur={(value) => {
          if (value !== formState.maxWords) commitToUrl()
        }}
      />

      <WordCloudOptionNumberField
        label="Padding"
        min={0}
        defaultValue={formState.padding}
        onChange={(value) =>
          updateFields({
            padding: Math.max(0, value || 0),
          })
        }
        onBlur={(value) => {
          if (value !== formState.padding) commitToUrl()
        }}
      />

      <WordCloudOptionNumberField
        label="Min font size"
        min={4}
        max={48}
        defaultValue={formState.minFontSize}
        onChange={(value) =>
          updateFields({
            minFontSize: Math.min(48, Math.max(4, value || 14)),
          })
        }
        onBlur={(value) => {
          if (value !== formState.minFontSize) commitToUrl()
        }}
      />

      <WordCloudOptionNumberField
        label="Max font size"
        min={12}
        max={120}
        defaultValue={formState.maxFontSize}
        onChange={(value) =>
          updateFields({
            maxFontSize: Math.min(120, Math.max(12, value || 72)),
          })
        }
        onBlur={(value) => {
          if (value !== formState.maxFontSize) commitToUrl()
        }}
      />

      <WordCloudOptionSelectField
        label="Scale"
        className="sm:col-span-2"
        defaultValue={formState.scale}
        options={SCALE_OPTIONS}
        onChange={(value) => updateFields({ scale: value as ScaleType })}
        onBlur={(value) => {
          if (value !== formState.scale) commitToUrl()
        }}
      />

      <WordCloudOptionSelectField
        label="Font family"
        className="sm:col-span-2"
        defaultValue={formState.fontFamily}
        options={FONT_FAMILY_OPTIONS}
        onChange={(value) => updateFields({ fontFamily: value })}
        onBlur={(value) => {
          if (value !== formState.fontFamily) commitToUrl()
        }}
      />

      <WordCloudOptionCheckboxField
        label="Keep layout consistent"
        defaultChecked={formState.deterministic}
        onChange={(checked) => updateFields({ deterministic: checked })}
        onBlur={(checked) => {
          if (checked !== formState.deterministic) commitToUrl()
        }}
      />

      <WordCloudOptionNumberField
        label="Rotations"
        min={0}
        max={12}
        defaultValue={formState.rotations}
        onChange={(value) =>
          updateFields({
            rotations: Math.max(0, value || 0),
          })
        }
        onBlur={(value) => {
          if (value !== formState.rotations) commitToUrl()
        }}
      />

      <WordCloudOptionNumberField
        label="Rotation min (°)"
        min={-360}
        max={360}
        defaultValue={formState.rotationMin}
        onChange={(value) =>
          updateFields({
            rotationMin: clampRotation(value),
          })
        }
        onBlur={(value) => {
          if (value !== formState.rotationMin) commitToUrl()
        }}
      />

      <WordCloudOptionNumberField
        label="Rotation max (°)"
        min={-360}
        max={360}
        defaultValue={formState.rotationMax}
        onChange={(value) =>
          updateFields({
            rotationMax: clampRotation(value),
          })
        }
        onBlur={(value) => {
          if (value !== formState.rotationMax) commitToUrl()
        }}
      />

      <WordCloudOptionColorField
        label="Background color"
        className="sm:col-span-2"
        defaultValue={formState.backgroundColor}
        onChange={(value) => updateFields({ backgroundColor: value })}
        onBlur={(value) => {
          if (value !== formState.backgroundColor) commitToUrl()
        }}
      />

      <WordCloudOptionPaletteField
        defaultColors={formState.colors}
        onBlur={(colors) => {
          updateFields({ colors })
          const same =
            colors.length === formState.colors.length &&
            colors.every((c, i) => c === formState.colors[i])
          if (!same) commitToUrl()
        }}
      />
    </div>
  );
}
