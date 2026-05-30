import { z } from "zod";
import {
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
	translatorScaleOptions,
	translatorSpiralOptions,
} from "#/features/word-cloud/translatorSearchState";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import { translatorSourceLanguageRouteSchema } from "#/lib/translatorSourceLanguages";

const translatorSearchFields = {
	input: z.string().optional(),
	sourceLanguage: translatorSourceLanguageRouteSchema,
	translated: booleanSearchParam.optional(),
	minFontSize: z.coerce.number().int().min(1).max(200).optional(),
	maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
	padding: z.coerce.number().int().min(0).max(20).optional(),
	scale: z.enum(translatorScaleOptions).optional(),
	spiral: z.enum(translatorSpiralOptions).optional(),
	rotationMin: z.coerce.number().int().min(-360).max(360).optional(),
	rotationMax: z.coerce.number().int().min(-360).max(360).optional(),
	rotations: z.coerce.number().int().min(0).optional(),
	deterministic: booleanSearchParam.optional(),
	fontFamily: z.string().optional(),
	backgroundColor: z.string().optional(),
	colors: csvSearchParam.optional(),
	hiddenLanguages: csvSearchParam.optional(),
	weights: z.string().optional(),
} as const;

export const translatorSearchSchema = z.object(translatorSearchFields);

const cloud2SearchFields = {
	cloud2Shape: z.enum(translatorCloud2ShapeOptions).optional(),
	cloud2Ellipticity: z.coerce.number().min(0).max(1).optional(),
	cloud2Shuffle: booleanSearchParam.optional(),
	cloud2RotateRatio: z.coerce.number().min(0).max(1).optional(),
	cloud2Color: z
		.enum(["random-dark", "random-light", "custom"] as const)
		.optional(),
	cloud2GridSize: z.coerce.number().int().min(4).max(32).optional(),
	cloud2MinRotation: z.coerce.number().int().min(-180).max(180).optional(),
	cloud2MaxRotation: z.coerce.number().int().min(-180).max(180).optional(),
	cloud2RotationSteps: z.coerce.number().int().min(0).max(16).optional(),
	cloud2MinSize: z.coerce.number().int().min(0).max(72).optional(),
	cloud2FontWeight: z.enum(translatorCloud2FontWeightOptions).optional(),
} as const;

export const experimentalTranslatorSearchSchema = z.object({
	...translatorSearchFields,
	...cloud2SearchFields,
});
