import { Link } from "@tanstack/react-router";
import NavLink from "./NavLink";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-line bg-header-bg px-4 backdrop-blur-lg">
			<nav className="mx-auto flex w-[min(1180px,calc(100%-1rem))] flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4 sm:py-5">
				<Link
					to="/"
					className="shrink-0 font-display text-lg font-black tracking-tight no-underline text-glow-pink hover:text-neon-pink sm:text-[22px]"
				>
					<span lang="ja">多言</span> MANYTONGUES
				</Link>

				<div className="flex flex-wrap items-center gap-1.5 text-[13px]">
					<NavLink to="/" activeOptions={{ exact: true }}>
						home
					</NavLink>
					<NavLink to="/text-cloud">text_cloud</NavLink>
					<NavLink to="/translate">translate</NavLink>
				</div>
			</nav>
		</header>
	);
}
