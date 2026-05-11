export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-line px-4 pb-14 pt-10 text-sea-ink-soft">
      <div className="mx-auto flex w-[min(1080px,calc(100%-2rem))] flex-col items-center justify-center gap-4 text-center">
        <p className="m-0 text-sm">
          &copy; {year} Max Cohen. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
