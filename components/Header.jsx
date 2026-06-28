import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-accentDark text-sm font-semibold text-surface shadow-card">
            MA
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Mülakat Atlası</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#companies" className="transition hover:text-ink">Şirketler</a>
          <a href="#insights" className="transition hover:text-ink">İçgörüler</a>
          <a href="#share" className="transition hover:text-ink">Deneyim Paylaş</a>
        </nav>

        <button className="hidden items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 md:flex">
          <Search size={16} />
          Şirket ara
        </button>

        <button className="rounded-full bg-accentDark px-4 py-2 text-sm font-medium text-surface shadow-card transition hover:-translate-y-0.5 md:hidden">
          Başla
        </button>
      </div>
    </header>
  );
}
