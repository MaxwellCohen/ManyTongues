import unboundedLatin900 from "@fontsource/unbounded/files/unbounded-latin-900-normal.woff2?url";
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
				rel: "preload",
				href: unboundedLatin900,
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				id: "gf-fonts",
				rel: "stylesheet",
				media: "print",
				"data-href":
					"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;900&family=Noto+Sans+KR:wght@700;900&family=Noto+Kufi+Arabic:wght@700;900&display=swap",
			},
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
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static font-swap snippet
					dangerouslySetInnerHTML={{
						__html:
							"(function(){var l=document.getElementById('gf-fonts');if(!l)return;function g(){l.href=l.dataset.href;l.media='all'}if(document.readyState==='complete')setTimeout(g,500);else addEventListener('load',function(){setTimeout(g,500)})})()",
					}}
				/>
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
