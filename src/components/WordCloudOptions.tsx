import WordCloudOptionCheckboxField from "#/components/word-cloud-options/WordCloudOptionCheckboxField";
import WordCloudOptionColorField from "#/components/word-cloud-options/WordCloudOptionColorField";
import WordCloudOptionNumberField from "#/components/word-cloud-options/WordCloudOptionNumberField";
import WordCloudOptionPaletteField from "#/components/word-cloud-options/WordCloudOptionPaletteField";
import WordCloudOptionSelectField from "#/components/word-cloud-options/WordCloudOptionSelectField";
import {
  FONT_FAMILY_OPTIONS,
  SCALE_OPTIONS,
  SPIRAL_OPTIONS,
  type ScaleType,
  type SpiralType,
} from "#/lib/wordCloudUtils";

export type WordCloudOptionFields = {
  padding: number;
  minFontSize: number;
  maxFontSize: number;
  scale: ScaleType;
  spiral: SpiralType;
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
  onUpdateSearch,
}: {
  formState: WordCloudOptionFields;
  onUpdateSearch: (updates: Partial<WordCloudOptionFields>) => void;
}) {
  return (
    <div
      className="grid gap-3 pt-1 sm:grid-cols-2"
    >
      <WordCloudOptionNumberField
        label="Padding"
        min={0}
        value={formState.padding}
        defaultValue={formState.padding}
        onChange={(value) =>
          onUpdateSearch({
            padding: Math.max(0, value || 0),
          })
        }
        onBlur={(value) => {
          if (value !== formState.padding) onUpdateSearch({ padding: Math.max(0, value || 0) });
        }}
      />

      <WordCloudOptionNumberField
        label="Min font size"
        min={4}
        max={48}
        value={formState.minFontSize}
        defaultValue={formState.minFontSize}
        onChange={(value) =>
          onUpdateSearch({
            minFontSize: Math.min(48, Math.max(4, value || 14)),
          })
        }
        onBlur={(value) => {
          if (value !== formState.minFontSize) onUpdateSearch({ minFontSize: Math.min(48, Math.max(4, value || 14)) });
        }}
      />

      <WordCloudOptionNumberField
        label="Max font size"
        min={12}
        max={120}
        value={formState.maxFontSize}
        defaultValue={formState.maxFontSize}
        onChange={(value) =>
          onUpdateSearch({
            maxFontSize: Math.min(120, Math.max(12, value || 72)),
          })
        }
        onBlur={(value) => {
          if (value !== formState.maxFontSize) onUpdateSearch({ maxFontSize: Math.min(120, Math.max(12, value || 72)) });
        }}
      />

      <WordCloudOptionSelectField
        label="Scale"
        className="sm:col-span-2"
        value={formState.scale}
        defaultValue={formState.scale}
        options={SCALE_OPTIONS}
        onChange={(value) => onUpdateSearch({ scale: value as ScaleType })}
        onBlur={(value) => {
          if (value !== formState.scale) onUpdateSearch({ scale: value as ScaleType });
        }}
      />

      <WordCloudOptionSelectField
        label="Spiral"
        className="sm:col-span-2"
        value={formState.spiral}
        defaultValue={formState.spiral}
        options={SPIRAL_OPTIONS}
        onChange={(value) => onUpdateSearch({ spiral: value as SpiralType })}
        onBlur={(value) => {
          if (value !== formState.spiral) onUpdateSearch({ spiral: value as SpiralType });
        }}
      />

      <WordCloudOptionSelectField
        label="Font family"
        className="sm:col-span-2"
        value={formState.fontFamily}
        defaultValue={formState.fontFamily}
        options={FONT_FAMILY_OPTIONS}
        onChange={(value) => onUpdateSearch({ fontFamily: value })}
        onBlur={(value) => {
          if (value !== formState.fontFamily) onUpdateSearch({ fontFamily: value });
        }}
      />

      <WordCloudOptionCheckboxField
        label="Keep layout consistent"
        checked={formState.deterministic}
        defaultChecked={formState.deterministic}
        onChange={(checked) => onUpdateSearch({ deterministic: checked })}
        onBlur={(checked) => {
          if (checked !== formState.deterministic) onUpdateSearch({ deterministic: checked });
        }}
      />

      <WordCloudOptionNumberField
        label="Rotations"
        min={0}
        value={formState.rotations}
        defaultValue={formState.rotations}
        onChange={(value) =>
          onUpdateSearch({
            rotations: Math.max(0, value || 0),
          })
        }
        onBlur={(value) => {
          if (value !== formState.rotations) onUpdateSearch({ rotations: Math.max(0, value || 0) });
        }}
      />

      <WordCloudOptionNumberField
        label="Rotation min (°)"
        min={-360}
        max={360}
        value={formState.rotationMin}
        defaultValue={formState.rotationMin}
        onChange={(value) =>
          onUpdateSearch({
            rotationMin: clampRotation(value),
          })
        }
        onBlur={(value) => {
          if (value !== formState.rotationMin) onUpdateSearch({ rotationMin: clampRotation(value) });
        }}
      />

      <WordCloudOptionNumberField
        label="Rotation max (°)"
        min={-360}
        max={360}
        value={formState.rotationMax}
        defaultValue={formState.rotationMax}
        onChange={(value) =>
          onUpdateSearch({
            rotationMax: clampRotation(value),
          })
        }
        onBlur={(value) => {
          if (value !== formState.rotationMax) onUpdateSearch({ rotationMax: clampRotation(value) });
        }}
      />

      <WordCloudOptionColorField
      key={`background-color-${formState.backgroundColor}`}
        label="Background color"
        className="sm:col-span-2"
        defaultValue={formState.backgroundColor}
        onChange={(value) => onUpdateSearch({ backgroundColor: value })}
        onBlur={(value) => {
          if (value !== formState.backgroundColor) onUpdateSearch({ backgroundColor: value });
        }}
      />

      <WordCloudOptionPaletteField
        key={`text-color-${formState.colors.join('-')}`}
        defaultColors={formState.colors}
        onChange={(colors) => onUpdateSearch({ colors })}
        onBlur={(colors) => {
          const same =
            colors.length === formState.colors.length &&
            colors.every((c, i) => c === formState.colors[i]);
          if (!same) onUpdateSearch({ colors });
        }}
      />
    </div>
  );
}
