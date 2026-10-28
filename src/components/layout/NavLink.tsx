import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link>;

const navLinkBaseClassName =
	"inline-flex items-center rounded-full border px-3.5 py-2 font-mono no-underline transition-[background-color,color,border-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan";

const navLinkClassName = `${navLinkBaseClassName} border-white/10 text-[#bdb3e6] hover:border-neon-cyan/60 hover:text-neon-cyan`;

const activeNavLinkClassName = `${navLinkBaseClassName} border-neon-cyan bg-neon-cyan text-night shadow-[0_0_18px_var(--color-neon-cyan)] hover:text-night`;

export default function NavLink(props: NavLinkProps) {
	return (
		<Link
			{...props}
			className={navLinkClassName}
			activeProps={{ className: activeNavLinkClassName }}
		/>
	);
}
