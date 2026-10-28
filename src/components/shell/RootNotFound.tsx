import { Link } from "@tanstack/react-router";

export default function RootNotFound() {
	return (
		<div className="mx-auto max-w-lg rounded-[28px] border border-line bg-panel p-8 text-center shadow-island">
			<p className="font-mono text-eyebrow font-bold text-neon-lime">
				{"// error 404"}
			</p>
			<h1 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] text-glow-pink">
				Page not found
			</h1>
			<p className="mt-3 font-mono text-sm text-sea-ink-soft">
				The page you're looking for doesn't exist or has moved.
			</p>
			<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
