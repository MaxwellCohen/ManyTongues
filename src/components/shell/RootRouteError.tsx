import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export default function RootRouteError({ error, reset }: ErrorComponentProps) {
	return (
		<div className="mx-auto max-w-lg rounded-[28px] border border-neon-pink/40 bg-panel p-8 text-center shadow-island">
			<p className="font-mono text-eyebrow font-bold text-neon-amber">
				{"// runtime error"}
			</p>
			<h1 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] text-glow-pink">
				Something went wrong
			</h1>
			<p className="mt-3 wrap-break-word font-mono text-sm text-sea-ink-soft">
				{error instanceof Error ? error.message : String(error)}
			</p>
			<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onClick={reset}
					className="rounded-2xl bg-neon-lime px-5 py-2.5 font-display text-sm font-extrabold text-night uppercase shadow-glow-lime hover:bg-[#C4E09C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan"
				>
					Try again
				</button>
				<Link
					to="/"
					className="rounded-full border border-neon-cyan px-5 py-2 font-mono text-sm font-bold text-neon-cyan no-underline hover:bg-neon-cyan/10 hover:shadow-glow-cyan"
				>
					{"← back to home"}
				</Link>
			</div>
		</div>
	);
}
