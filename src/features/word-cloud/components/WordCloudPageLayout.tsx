import type { ReactNode } from "react";

type WordCloudPageLayoutProps = {
	cloud: ReactNode;
	children: ReactNode;
};

export default function WordCloudPageLayout({
	cloud,
	children,
}: WordCloudPageLayoutProps) {
	return (
		<div className="animate-rise-in mt-10 flex min-w-0 flex-col gap-8 lg:grid lg:grid-cols-[1fr] lg:items-start lg:gap-x-8 lg:gap-y-8">
			<div className=" top-6 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden lg:self-start">
				{cloud}
			</div>
			<div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden  overflow-y-auto">
				{children}
			</div>
		</div>
	);
}
