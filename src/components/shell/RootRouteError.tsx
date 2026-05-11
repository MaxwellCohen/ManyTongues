import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export default function RootRouteError({ error, reset }: ErrorComponentProps) {
	return (
		<div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
			<h1 className="font-display text-xl font-semibold text-sea-ink">
				Something went wrong
			</h1>
			<p className="mt-2 text-sm text-sea-ink-soft wrap-break-word">
				{error.message}
			</p>
			<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onClick={reset}
					className="rounded-lg border border-line bg-foam px-4 py-2 text-sm font-semibold text-sea-ink hover:border-lagoon hover:bg-lagoon/10"
				>
					Try again
				</button>
				<Link
					to="/"
					className="text-sm font-semibold text-lagoon no-underline hover:underline"
				>
					Back to home
				</Link>
			</div>
		</div>
	);
}
