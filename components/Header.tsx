import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-white">
            M
          </span>
          <span className="font-display text-lg font-semibold text-primary">
            Meu Amigo Fraudes
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold text-muted">
          <Link href="/#" className="transition hover:text-primary">
            Como funciona
          </Link>
          <Link href="/criar" className="transition hover:text-primary">
            Criar grupo
          </Link>
        </nav>
      </div>
    </header>
  );
}
