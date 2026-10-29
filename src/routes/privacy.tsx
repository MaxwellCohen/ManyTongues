import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import PageHero from "#/components/layout/PageHero";

const LAST_UPDATED = "October 28, 2026";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{ title: "Privacy · ManyTongues" },
			{
				name: "description",
				content: "What ManyTongues collects, where it goes, and why.",
			},
		],
	}),
	component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="space-y-3">
			<h2 className="m-0 font-display text-xl font-black tracking-[-0.02em] text-sea-ink">
				{title}
			</h2>
			<div className="space-y-3 font-mono text-sm leading-relaxed text-sea-ink-soft [&_a]:text-neon-cyan [&_li]:ml-5 [&_li]:list-disc">
				{children}
			</div>
		</section>
	);
}

function PrivacyPage() {
	return (
		<div className="mx-auto w-[min(760px,100%)] space-y-10">
			<PageHero
				kicker="privacy"
				title="Privacy notice"
				description={`Plain-language summary of what this app collects. Last updated ${LAST_UPDATED}.`}
			/>

			<Section title="Text Cloud">
				<p>
					Text you paste into the Text Cloud is processed in your browser and is
					not sent to our server. It is saved in the page URL so the cloud can
					be shared, so anyone you share that link with can read the text.
				</p>
			</Section>

			<Section title="Translator">
				<p>When you translate a phrase:</p>
				<ul>
					<li>
						The phrase and its source language are sent to{" "}
						<a href="https://cloud.google.com/translate/data-usage">
							Google Cloud Translation
						</a>{" "}
						and, if that fails,{" "}
						<a href="https://learn.microsoft.com/legal/cognitive-services/translator/data-privacy">
							Microsoft Translator
						</a>
						.
					</li>
					<li>
						The phrase and its translations are cached in our database so repeat
						requests are faster. Cached phrases are not linked to you.
					</li>
					<li>
						Your IP address is stored to enforce a rate limit on translation
						requests. It is used only for that purpose.
					</li>
				</ul>
				<p>Please don't enter personal or sensitive information as a phrase.</p>
			</Section>

			<Section title="Analytics">
				<p>
					We use <a href="https://posthog.com/privacy">PostHog</a> to understand
					how the app is used: page views, clicks, errors, and events such as
					downloading a cloud or removing a language. PostHog stores an
					identifier in your browser to group visits. We do not send the text or
					phrases you enter to analytics, only counts and lengths.
				</p>
			</Section>

			<Section title="What we don't do">
				<ul>
					<li>No accounts, and no names or email addresses collected.</li>
					<li>No advertising, and no selling or sharing data for ads.</li>
				</ul>
			</Section>

			<Section title="Contact">
				<p>
					Questions or deletion requests:{" "}
					<a href="https://github.com/MaxwellCohen/ManyTongues/issues">
						open an issue on GitHub
					</a>
					.
				</p>
			</Section>
		</div>
	);
}
