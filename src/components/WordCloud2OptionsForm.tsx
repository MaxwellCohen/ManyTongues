import WordCloudOptionCheckboxField from "#/components/word-cloud-options/WordCloudOptionCheckboxField";
import WordCloudOptionColorField from "#/components/word-cloud-options/WordCloudOptionColorField";
import WordCloudOptionNumberField from "#/components/word-cloud-options/WordCloudOptionNumberField";
import WordCloudOptionPaletteField from "#/components/word-cloud-options/WordCloudOptionPaletteField";
import WordCloudOptionSelectField from "#/components/word-cloud-options/WordCloudOptionSelectField";
import {
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
} from "#/features/word-cloud/translateState";
import { DEFAULT_COLORS } from "#/lib/wordCloudUtils";

export type CloudStyleFormState = {
	backgroundColor: string;
	cloud2Shape: (typeof translatorCloud2ShapeOptions)[number];
	cloud2Ellipticity: number;
	cloud2Shuffle: boolean;
	cloud2RotateRatio: number;
	cloud2Color: (typeof translatorCloud2ColorOptions)[number];
	cloud2GridSize: number;
	cloud2MinRotation: number;
	cloud2MaxRotation: number;
	cloud2RotationSteps: number;
	cloud2MinSize: number;
	cloud2FontWeight: (typeof translatorCloud2FontWeightOptions)[number];
	colors: string[];
};

const SHAPE_LABELS: Record<(typeof translatorCloud2ShapeOptions)[number], string> = {
	circle: "Circle",
	cardioid: "Cardioid",
	diamond: "Diamond",
	square: "Square",
	"triangle-forward": "Triangle forward",
	triangle: "Triangle",
	pentagon: "Pentagon",
	star: "Star",
};

const COLOR_LABELS: Record<(typeof translatorCloud2ColorOptions)[number], string> = {
	"random-dark": "Random dark",
	"random-light": "Random light",
	custom: "Custom palette",
};

const FONT_WEIGHT_LABELS: Record<
	(typeof translatorCloud2FontWeightOptions)[number],
	string
> = {
	normal: "Normal",
	bold: "Bold",
};

export default function WordCloud2OptionsForm({
	formState,
	defaults,
	onUpdateSearch,
}: {
	formState: CloudStyleFormState;
	defaults: Partial<CloudStyleFormState>;
	onUpdateSearch: (updates: Partial<CloudStyleFormState>) => void;
}) {
	return (
		<div className="space-y-3 pt-1">
			<div className="flex justify-end">
				<button
					type="button"
					onClick={() => onUpdateSearch(defaults)}
					className="rounded-lg border border-line bg-foam px-3 py-1.5 text-sm font-medium text-sea-ink hover:border-lagoon hover:bg-lagoon/10 hover:text-lagoon"
				>
					Reset to defaults
				</button>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<WordCloudOptionColorField
					key={`background-color-${formState.backgroundColor}`}
					label="Background"
					defaultValue={formState.backgroundColor}
					onChange={(value) => onUpdateSearch({ backgroundColor: value })}
					onBlur={(value) => {
						if (value !== formState.backgroundColor)
							onUpdateSearch({ backgroundColor: value });
					}}
					className="sm:col-span-2"
				/>
				<WordCloudOptionSelectField
					label="Shape"
					value={formState.cloud2Shape}
					defaultValue={formState.cloud2Shape}
					options={translatorCloud2ShapeOptions.map((value) => ({
						value,
						label: SHAPE_LABELS[value],
					}))}
					onChange={(value) =>
						onUpdateSearch({
							cloud2Shape: value as CloudStyleFormState["cloud2Shape"],
						})
					}
					onBlur={(value) =>
						onUpdateSearch({
							cloud2Shape: value as CloudStyleFormState["cloud2Shape"],
						})
					}
				/>
				<WordCloudOptionSelectField
					label="Color"
					value={formState.cloud2Color}
					defaultValue={formState.cloud2Color}
					options={translatorCloud2ColorOptions.map((value) => ({
						value,
						label: COLOR_LABELS[value],
					}))}
					onChange={(value) =>
						onUpdateSearch({
							cloud2Color: value as CloudStyleFormState["cloud2Color"],
						})
					}
					onBlur={(value) =>
						onUpdateSearch({
							cloud2Color: value as CloudStyleFormState["cloud2Color"],
						})
					}
				/>
				{formState.cloud2Color === "custom" && (
					<WordCloudOptionPaletteField
						defaultColors={
							formState.colors?.length ? formState.colors : DEFAULT_COLORS
						}
						onChange={(colors) => onUpdateSearch({ colors })}
						onBlur={(colors) => onUpdateSearch({ colors })}
					/>
				)}
				<WordCloudOptionNumberField
					label="Ellipticity"
					min={0}
					max={1}
					step={0.05}
					value={formState.cloud2Ellipticity}
					defaultValue={formState.cloud2Ellipticity}
					onChange={(value) => {
						const v = Math.min(1, Math.max(0, Number(value) || 0.65));
						onUpdateSearch({ cloud2Ellipticity: Math.round(v * 100) / 100 });
					}}
					onBlur={(value) => {
						const v = Math.min(1, Math.max(0, Number(value) || 0.65));
						const rounded = Math.round(v * 100) / 100;
						if (rounded !== formState.cloud2Ellipticity)
							onUpdateSearch({ cloud2Ellipticity: rounded });
					}}
				/>
				<WordCloudOptionNumberField
					label="Rotate ratio"
					min={0}
					max={1}
					step={0.05}
					value={formState.cloud2RotateRatio}
					defaultValue={formState.cloud2RotateRatio}
					onChange={(value) =>
						onUpdateSearch({
							cloud2RotateRatio: Math.min(1, Math.max(0, value ?? 0.1)),
						})
					}
					onBlur={(value) => {
						const v = Math.min(1, Math.max(0, value ?? 0.1));
						if (v !== formState.cloud2RotateRatio)
							onUpdateSearch({ cloud2RotateRatio: v });
					}}
				/>
				<WordCloudOptionCheckboxField
					label="Shuffle words"
					checked={formState.cloud2Shuffle}
					defaultChecked={formState.cloud2Shuffle}
					onChange={(checked) => onUpdateSearch({ cloud2Shuffle: checked })}
					onBlur={(checked) => onUpdateSearch({ cloud2Shuffle: checked })}
				/>
				<WordCloudOptionNumberField
					label="Grid size (px)"
					min={4}
					max={32}
					value={formState.cloud2GridSize}
					defaultValue={formState.cloud2GridSize}
					onChange={(value) =>
						onUpdateSearch({
							cloud2GridSize: Math.min(32, Math.max(4, Math.round(value ?? 8))),
						})
					}
					onBlur={(value) => {
						const v = Math.min(32, Math.max(4, Math.round(value ?? 8)));
						if (v !== formState.cloud2GridSize)
							onUpdateSearch({ cloud2GridSize: v });
					}}
				/>
				<WordCloudOptionNumberField
					label="Min rotation (°)"
					min={-180}
					max={180}
					value={formState.cloud2MinRotation}
					defaultValue={formState.cloud2MinRotation}
					onChange={(value) =>
						onUpdateSearch({
							cloud2MinRotation: Math.min(
								180,
								Math.max(-180, Math.round(value ?? -90)),
							),
						})
					}
					onBlur={(value) => {
						const v = Math.min(180, Math.max(-180, Math.round(value ?? -90)));
						if (v !== formState.cloud2MinRotation)
							onUpdateSearch({ cloud2MinRotation: v });
					}}
				/>
				<WordCloudOptionNumberField
					label="Max rotation (°)"
					min={-180}
					max={180}
					value={formState.cloud2MaxRotation}
					defaultValue={formState.cloud2MaxRotation}
					onChange={(value) =>
						onUpdateSearch({
							cloud2MaxRotation: Math.min(
								180,
								Math.max(-180, Math.round(value ?? 90)),
							),
						})
					}
					onBlur={(value) => {
						const v = Math.min(180, Math.max(-180, Math.round(value ?? 90)));
						if (v !== formState.cloud2MaxRotation)
							onUpdateSearch({ cloud2MaxRotation: v });
					}}
				/>
				<WordCloudOptionNumberField
					label="Rotation steps"
					min={0}
					max={16}
					value={formState.cloud2RotationSteps}
					defaultValue={formState.cloud2RotationSteps}
					onChange={(value) =>
						onUpdateSearch({
							cloud2RotationSteps: Math.min(
								16,
								Math.max(0, Math.round(value ?? 0)),
							),
						})
					}
					onBlur={(value) => {
						const v = Math.min(16, Math.max(0, Math.round(value ?? 0)));
						if (v !== formState.cloud2RotationSteps)
							onUpdateSearch({ cloud2RotationSteps: v });
					}}
				/>
				<WordCloudOptionNumberField
					label="Min font size (px)"
					min={0}
					max={72}
					value={formState.cloud2MinSize}
					defaultValue={formState.cloud2MinSize}
					onChange={(value) =>
						onUpdateSearch({
							cloud2MinSize: Math.min(72, Math.max(0, Math.round(value ?? 0))),
						})
					}
					onBlur={(value) => {
						const v = Math.min(72, Math.max(0, Math.round(value ?? 0)));
						if (v !== formState.cloud2MinSize)
							onUpdateSearch({ cloud2MinSize: v });
					}}
				/>
				<WordCloudOptionSelectField
					label="Font weight"
					value={formState.cloud2FontWeight}
					defaultValue={formState.cloud2FontWeight}
					options={translatorCloud2FontWeightOptions.map((value) => ({
						value,
						label: FONT_WEIGHT_LABELS[value],
					}))}
					onChange={(value) =>
						onUpdateSearch({
							cloud2FontWeight: value as CloudStyleFormState["cloud2FontWeight"],
						})
					}
					onBlur={(value) =>
						onUpdateSearch({
							cloud2FontWeight: value as CloudStyleFormState["cloud2FontWeight"],
						})
					}
				/>
			</div>
		</div>
	);
}
