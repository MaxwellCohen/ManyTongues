import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
	preset: "vercel",
	routeRules: {
		// Proxy PostHog analytics to avoid CORS and ad blockers
		"/ingest": { proxy: "https://us.i.posthog.com/" },
		"/ingest/**": { proxy: "https://us.i.posthog.com/**" },
	},
});
