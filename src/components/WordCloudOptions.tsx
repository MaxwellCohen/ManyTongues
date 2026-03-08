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
  const { updateFields, commitToUrl } =
    createXStateFormControls<WordCloudOptionFields>(send);

  return (
    <div className="grid gap-3 pt-1 sm:grid-cols-2">
      <WordCloudOptionNumberField
        label="Max words"
        min={5}
        value={formState.maxWords}
        onChange={(value) => updateFields({ maxWords: value })}
        onBlur={commitToUrl}
      />

      <WordCloudOptionNumberField
        label="Padding"
        min={0}
        value={formState.padding}
        onChange={(value) =>
          updateFields({
            padding: Math.max(0, value || 0),
          })
        }
        onBlur={commitToUrl}
      />

      <WordCloudOptionNumberField
        label="Min font size"
        min={4}
        max={48}
        value={formState.minFontSize}
        onChange={(value) =>
          updateFields({
            minFontSize: Math.min(48, Math.max(4, value || 14)),
          })
        }
        onBlur={commitToUrl}
      />

      <WordCloudOptionNumberField
        label="Max font size"
        min={12}
        max={120}
        value={formState.maxFontSize}
        onChange={(value) =>
          updateFields({
            maxFontSize: Math.min(120, Math.max(12, value || 72)),
          })
        }
        onBlur={commitToUrl}
      />

      <WordCloudOptionSelectField
        label="Scale"
        className="sm:col-span-2"
        value={formState.scale}
        options={SCALE_OPTIONS}
        onChange={(value) => updateFields({ scale: value as ScaleType })}
        onBlur={commitToUrl}
      />

      <WordCloudOptionSelectField
        label="Font family"
        className="sm:col-span-2"
        value={formState.fontFamily}
        options={FONT_FAMILY_OPTIONS}
        onChange={(value) => updateFields({ fontFamily: value })}
        onBlur={commitToUrl}
      />

      <WordCloudOptionCheckboxField
        label="Keep layout consistent"
        checked={formState.deterministic}
        onChange={(checked) => updateFields({ deterministic: checked })}
        onBlur={commitToUrl}
      />

      <WordCloudOptionNumberField
        label="Rotations"
        min={0}
        value={formState.rotations}
        onChange={(value) =>
          updateFields({
            rotations: Math.max(0, value || 0),
          })
        }
        onBlur={commitToUrl}
      />

      <WordCloudOptionNumberField
        label="Rotation min (°)"
        min={-360}
        max={360}
        value={formState.rotationMin}
        onChange={(value) =>
          updateFields({
            rotationMin: clampRotation(value),
          })
        }
        onBlur={commitToUrl}
      />

      <WordCloudOptionNumberField
        label="Rotation max (°)"
        min={-360}
        max={360}
        value={formState.rotationMax}
        onChange={(value) =>
          updateFields({
            rotationMax: clampRotation(value),
          })
        }
        onBlur={commitToUrl}
      />

      <WordCloudOptionColorField
        label="Background color"
        className="sm:col-span-2"
        value={formState.backgroundColor}
        onChange={(value) => updateFields({ backgroundColor: value })}
        onBlur={commitToUrl}
      />

      <WordCloudOptionPaletteField
        colors={formState.colors}
        onChangeColor={(index, value) => {
          const next = [...formState.colors];
          next[index] = value;
          updateFields({ colors: next });
        }}
        onRemoveColor={(index) => {
          updateFields({
            colors: formState.colors.filter((_, j) => j !== index),
          });
          commitToUrl();
        }}
        onAddColor={() => {
          updateFields({ colors: [...formState.colors, "#6b7280"] });
          commitToUrl();
        }}
        onBlur={commitToUrl}
      />
    </div>
  );
}
