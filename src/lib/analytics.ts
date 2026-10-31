type PostHog = typeof import("posthog-js").default;

let client: Promise<PostHog> | undefined;

/** Loads and initializes posthog-js on demand, keeping it out of the entry bundle. */
export function loadAnalytics() {
	client ??= import("posthog-js").then(({ default: posthog }) => {
		posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string, {
			api_host: "/ingest",
			ui_host:
				import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
			capture_exceptions: true,
		});
		return posthog;
	});
	return client;
}

const analytics = {
	capture(event: string, properties?: Record<string, unknown>) {
		void loadAnalytics().then((posthog) => posthog.capture(event, properties));
	},
};

export function usePostHog() {
	return analytics;
}
