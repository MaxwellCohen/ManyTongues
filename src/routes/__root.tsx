import { PostHogProvider } from "@posthog/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import RootNotFound from "../components/shell/RootNotFound";
import RootRouteError from "../components/shell/RootRouteError";

import appCss from "../styles.css?url";

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
		links: [
			{
				rel: "stylesheet",
				href: appCss,
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
				<PostHogProvider
					apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string}
					options={{
						api_host: "/ingest",
						ui_host:
							import.meta.env.VITE_PUBLIC_POSTHOG_HOST ||
							"https://us.posthog.com",
						capture_exceptions: true,
					}}
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
				</PostHogProvider>
				<Scripts />
			</body>
		</html>
	);
}
