import jetbrainsMonoLatin400 from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url";
import unboundedLatin800 from "@fontsource/unbounded/files/unbounded-latin-800-normal.woff2?url";
import unboundedLatin900 from "@fontsource/unbounded/files/unbounded-latin-900-normal.woff2?url";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { loadAnalytics } from "#/lib/analytics";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import RootNotFound from "../components/shell/RootNotFound";
import RootRouteError from "../components/shell/RootRouteError";
import appCss from "../styles.css?inline";

export const Route = createRootRoute({
	errorComponent: RootRouteError,
	notFoundComponent: RootNotFound,
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "ManyTongues",
			},
			{
				name: "description",
				content:
					"Create word clouds from source text or translate a short phrase into multiple languages and compare the results visually.",
			},
			{
				property: "og:type",
				content: "website",
			},
		],
		styles: [{ children: appCss }],
		links: [
			{
				rel: "preload",
				href: unboundedLatin900,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				href: unboundedLatin800,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				href: jetbrainsMonoLatin400,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{ rel: "icon", href: "/favicon.ico", sizes: "any" },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const events = ["pointerdown", "keydown", "scroll"] as const;
		const start = () => {
			for (const event of events) window.removeEventListener(event, start);
			void loadAnalytics();
		};
		for (const event of events) {
			window.addEventListener(event, start, { once: true, passive: true });
		}
		return () => {
			for (const event of events) window.removeEventListener(event, start);
		};
	}, []);

	return (
		<html
			lang="en"
			className="dark"
			style={{ colorScheme: "dark" }}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
			</head>
			<body
				className="bg-night font-sans text-sea-ink antialiased wrap-anywhere selection:bg-neon-pink/35"
				suppressHydrationWarning
			>
				<Header />
				<main className="relative px-4 py-8 sm:py-12">{children}</main>
				<Footer />
				{import.meta.env.DEV ? (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				) : null}
				<Scripts />
			</body>
		</html>
	);
}
