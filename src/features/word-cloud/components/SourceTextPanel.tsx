import { useRef } from "react";
import { Field, FieldControl, FieldLabel } from "#/components/ui/field";
import { Textarea } from "#/components/ui/textarea";
import {
	NEON_CARD_HEADING_CLASS,
	NeonCard,
} from "#/features/word-cloud/components/neon";

export default function SourceTextPanel({
	defaultValue,
	onBlur,
}: {
	defaultValue: string;
	onBlur: (value: string) => void;
}) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<NeonCard>
			<Field id="wordcloud-input">
				<FieldLabel className={`mb-3 ${NEON_CARD_HEADING_CLASS}`}>
					Source text
				</FieldLabel>
				<div className="flex gap-2 rounded-2xl border border-white/14 bg-white/[0.045] p-3 font-mono transition-[border-color,box-shadow] focus-within:border-neon-lime/60 focus-within:shadow-glow-lime">
					<span aria-hidden className="text-sm leading-relaxed text-neon-lime">
						&gt;
					</span>
					<FieldControl>
						<Textarea
							ref={textareaRef}
							defaultValue={defaultValue}
							onBlur={() => onBlur(textareaRef.current?.value ?? "")}
							placeholder="Paste text, notes, a transcript, or lyrics..."
							rows={10}
							className="min-h-0 flex-1 resize-y rounded-none border-0 bg-transparent p-0 focus-visible:border-0 focus-visible:shadow-none focus-visible:ring-0"
						/>
					</FieldControl>
				</div>
			</Field>
		</NeonCard>
	);
}
