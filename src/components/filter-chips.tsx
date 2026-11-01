import Link from "next/link";

export type Chip = { key: string; label: string; href: string; active: boolean; color?: string };

export function FilterChips({ chips, label }: { chips: Chip[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2 pb-1">
        {chips.map((chip) => (
          <li key={chip.key} className="shrink-0">
            <Link
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={`tap-target flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold ${
                chip.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {chip.color && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chip.color }} />}
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
