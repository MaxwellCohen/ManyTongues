export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-20 border-t border-line px-4 pt-8 pb-12 font-mono text-xs text-muted-ink">
			<div className="mx-auto flex w-[min(1180px,calc(100%-1rem))] flex-col items-center justify-between gap-2 sm:flex-row">
				<p className="m-0">{`// © ${year} Max Cohen. All rights reserved.`}</p>
				<p className="m-0">{"// one phrase in → many tongues out"}</p>
			</div>
		</footer>
	);
}
