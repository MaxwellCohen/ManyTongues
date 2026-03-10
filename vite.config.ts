import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

import ReactCompiler from "babel-plugin-react-compiler";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	server: {
		port: 3500,
		proxy: {
			"/ingest": {
				target: "https://us.i.posthog.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/ingest/, ""),
				secure: false,
			},
		},
	},
	plugins: [
		devtools({
			eventBusConfig: {
				enabled: false,
			},
		}),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		viteReact({
			babel: {
				plugins: [ReactCompiler],
			},
		}),
		sentryTanstackStart({
			org: "maxwell-cohen",
			project: "manytongues",
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
	],
});

export default config;
