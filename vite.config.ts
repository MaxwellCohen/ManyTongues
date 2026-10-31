/// <reference path="./vite.config.env.d.ts" />

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";

import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	build: { sourcemap: true },
	resolve: {
		tsconfigPaths: true,
	},
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
		nitro(),
		tailwindcss(),
		tanstackStart({
			prerender: { enabled: true, crawlLinks: true },
		}),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
