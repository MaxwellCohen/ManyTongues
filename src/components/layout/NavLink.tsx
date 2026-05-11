import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

type NavLinkProps = ComponentProps<typeof Link>

const navLinkClassName =
  'relative inline-flex items-center text-sea-ink-soft no-underline transition-[background-color,color,border-color,transform] duration-150 hover:text-sea-ink after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,var(--color-lagoon),#7ed3bf)] after:transition-transform after:duration-150 hover:after:scale-x-100 max-sm:after:bottom-[-4px]'

const activeNavLinkClassName =
  'relative inline-flex items-center text-sea-ink no-underline transition-[background-color,color,border-color,transform] duration-150 after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-100 after:bg-[linear-gradient(90deg,var(--color-lagoon),#7ed3bf)] after:transition-transform after:duration-150 max-sm:after:bottom-[-4px]'

export default function NavLink(props: NavLinkProps) {
  return (
    <Link
      {...props}
      className={navLinkClassName}
      activeProps={{ className: activeNavLinkClassName }}
    />
  )
}
