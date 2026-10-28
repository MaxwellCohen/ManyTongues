import type { ReactNode } from "react";

type WordCloudPageLayoutProps = {
	cloud: ReactNode;
	children: ReactNode;
};

/** Neon stage: the cloud screen is the hero, controls stack as cards on the side. */
export default function WordCloudPageLayout({
	cloud,
	children,
}: WordCloudPageLayoutProps) {
	return (
		<div className="animate-rise-in mt-8 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
			<div className="min-w-0 lg:sticky lg:top-6">{cloud}</div>
			<div className="flex min-w-0 w-full flex-col gap-3">{children}</div>
		</div>
	);
}
