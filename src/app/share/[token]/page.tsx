import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import { resolveShareToken } from "@/lib/data/shareLinks";
import { listChildrenForFamily } from "@/lib/data/children";
import { listPublicGiftsForFamily } from "@/lib/data/gifts";
import { GiftCard } from "@/components/gift-card";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { filterGifts, occasionsOf } from "@/lib/gift-filters";

/*
 * Read-only page for grandparents, no account: big text (see `.share-root`
 * in globals.css), plain wording, works without JavaScript. Never shows the
 * parents' private notes nor gifts marked hidden (listPublicGiftsForFamily).
 */

const getShare = cache(resolveShareToken);

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const share = await getShare(token);
  return {
    title: share ? `Cadeaux — ${share.familyName}` : "Lieluwish",
    robots: { index: false, follow: false },
    manifest: share ? `/share/${token}/manifest` : undefined,
    appleWebApp: { capable: true, title: "Cadeaux", statusBarStyle: "default" },
  };
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} et ${names[names.length - 1]}`;
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ child?: string; occasion?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const share = await getShare(token);

  if (!share) {
    return (
      <main className="share-root mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <Image src="/logo.png" alt="" width={64} height={64} className="rounded-2xl" />
        <h1 className="text-xl font-semibold">Ce lien ne fonctionne plus</h1>
        <p className="text-slate-600">Demandez aux parents de vous renvoyer le lien des cadeaux.</p>
      </main>
    );
  }

  const [kids, gifts] = await Promise.all([
    listChildrenForFamily(share.familyId),
    listPublicGiftsForFamily(share.familyId),
  ]);

  const base = `/share/${token}`;
  const href = (p: { child?: string; occasion?: string }) => {
    const sp = new URLSearchParams();
    if (p.child) sp.set("child", p.child);
    if (p.occasion) sp.set("occasion", p.occasion);
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const childId = kids.some((k) => k.id === query.child) ? query.child : undefined;
  const occasions = occasionsOf(gifts);
  const occasion = query.occasion && occasions.includes(query.occasion) ? query.occasion : undefined;
  const visible = filterGifts(gifts, childId, occasion);
  const shownKids = childId ? kids.filter((k) => k.id === childId) : kids;

  const childChips: Chip[] = [
    { key: "all", label: "Tous les enfants", href: href({ occasion }), active: !childId },
    ...kids.map((k) => ({ key: k.id, label: k.firstName, href: href({ child: k.id, occasion }), active: k.id === childId, color: k.color })),
  ];
  const occasionChips: Chip[] = [
    { key: "all", label: "Toutes les occasions", href: href({ child: childId }), active: !occasion },
    ...occasions.map((o) => ({ key: o, label: o, href: href({ child: childId, occasion: o }), active: o === occasion })),
  ];

  return (
    <main className="share-root mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 py-6">
      <header className="flex items-center gap-3">
        <Image src="/logo.png" alt="" width={48} height={48} className="rounded-xl" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Les cadeaux de {joinNames(kids.map((k) => k.firstName))}</h1>
          <p className="text-sm text-slate-500">{share.familyName}</p>
        </div>
      </header>

      <p className="rounded-2xl bg-amber-50 p-4 text-slate-700">
        Les cadeaux <strong>« encore disponibles »</strong> n&apos;ont été choisis par personne. Ceux qui sont
        barrés sont déjà prévus. <strong>Vous voulez en offrir un ?</strong> Prévenez les parents pour
        qu&apos;ils le notent.
      </p>

      {kids.length > 1 && <FilterChips chips={childChips} label="Choisir un enfant" />}
      {occasions.length > 1 && <FilterChips chips={occasionChips} label="Choisir une occasion" />}

      {shownKids.map((child) => {
        const childGifts = visible.filter((g) => g.childId === child.id);
        const free = childGifts.filter((g) => g.status === "IDEA").length;
        return (
          <section key={child.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2 pt-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: child.color }} />
                {child.firstName}
              </h2>
              {childGifts.length > 0 && (
                <p className="text-sm text-slate-500">
                  {free === 0 ? "Tout est prévu" : `${free} encore disponible${free > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
            {childGifts.length === 0 && (
              <p className="rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center text-slate-500">
                Pas encore d&apos;idée de cadeau.
              </p>
            )}
            {childGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} audience="public" showOccasion={!occasion} />
            ))}
          </section>
        );
      })}
    </main>
  );
}
