import type { ReactNode } from "react";

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber px-3 py-1 text-xs font-semibold text-amber-foreground">
      عرض تجريبي
    </span>
  );
}

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <span className="text-2xl font-extrabold text-primary">تمرة</span>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
