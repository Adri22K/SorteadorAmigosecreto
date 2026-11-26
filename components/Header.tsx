import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent font-display text-lg font-bold text-white shadow-accentSoft">
            A
          </span>
          <span className="font-display text-lg font-semibold text-primary">
            Amigo Secreto <span className="text-accent">Fraudes</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold text-muted">
          <Link href="/#" className="transition hover:text-accent">
            Como funciona
          </Link>
          <Link href="/criar" className="transition hover:text-accent">
            Criar grupo
          </Link>
        </nav>
      </div>
    </header>
  );
}
