import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function posthogApiKey(): string | undefined {
	return (
		process.env.VITE_PUBLIC_POSTHOG_KEY?.trim() ||
		(import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined)?.trim()
	);
}

function posthogHost(): string | undefined {
	return (
		process.env.VITE_PUBLIC_POSTHOG_HOST?.trim() ||
		(import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined)?.trim()
	);
}

export function getPostHogClient() {
	if (!posthogClient) {
		posthogClient = new PostHog(posthogApiKey() ?? "", {
			host: posthogHost(),
			flushAt: 1,
			flushInterval: 0,
		});
	}
	return posthogClient;
}
