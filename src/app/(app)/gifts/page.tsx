import Link from "next/link";
import { listChildren } from "@/lib/data/children";
import { listGifts } from "@/lib/data/gifts";
import { GiftCard } from "@/components/gift-card";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { SubmitButton } from "@/components/submit-button";
import { filterGifts, occasionsOf, summary } from "@/lib/gift-filters";
import { GIFT_STATUSES, STATUS_LABEL } from "@/lib/gifts";
import { CARD, PRIMARY_BUTTON } from "@/components/ui";
import { setGiftStatusAction } from "./actions";

function href(params: { child?: string; occasion?: string }): string {
  const sp = new URLSearchParams();
  if (params.child) sp.set("child", params.child);
  if (params.occasion) sp.set("occasion", params.occasion);
  const qs = sp.toString();
  return qs ? `/gifts?${qs}` : "/gifts";
}

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; occasion?: string }>;
}) {
  const [kids, gifts, params] = await Promise.all([listChildren(), listGifts(), searchParams]);

  if (kids.length === 0) {
    return (
      <div className={`${CARD} flex flex-col items-center gap-3 py-8 text-center`}>
        <p className="text-4xl">🎁</p>
        <h1 className="text-lg font-bold text-slate-900">Bienvenue !</h1>
        <p className="text-slate-600">Commencez par ajouter les enfants, puis leurs idées de cadeaux.</p>
        <Link href="/children" className={PRIMARY_BUTTON}>
          Ajouter un enfant
        </Link>
      </div>
    );
  }

  const childId = kids.some((k) => k.id === params.child) ? params.child : undefined;
  const occasions = occasionsOf(gifts);
  const occasion = params.occasion && occasions.includes(params.occasion) ? params.occasion : undefined;
  const visible = filterGifts(gifts, childId, occasion);
  const shownKids = childId ? kids.filter((k) => k.id === childId) : kids;
  const back = href({ child: childId, occasion });

  const childChips: Chip[] = [
    { key: "all", label: "Tous", href: href({ occasion }), active: !childId },
    ...kids.map((k) => ({
      key: k.id,
      label: k.firstName,
      href: href({ child: k.id, occasion }),
      active: k.id === childId,
      color: k.color,
    })),
  ];
  const occasionChips: Chip[] = [
    { key: "all", label: "Toutes les occasions", href: href({ child: childId }), active: !occasion },
    ...occasions.map((o) => ({ key: o, label: o, href: href({ child: childId, occasion: o }), active: o === occasion })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-900">Cadeaux</h1>
        <Link
          href={childId ? `/gifts/new?child=${childId}` : "/gifts/new"}
          className="tap-target flex items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white active:bg-brand-700"
        >
          + Ajouter
        </Link>
      </div>

      {kids.length > 1 && <FilterChips chips={childChips} label="Filtrer par enfant" />}
      {occasions.length > 1 && <FilterChips chips={occasionChips} label="Filtrer par occasion" />}

      {shownKids.map((child) => {
        const childGifts = visible.filter((g) => g.childId === child.id);
        return (
          <section key={child.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2 pt-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: child.color }} />
                {child.firstName}
              </h2>
              {childGifts.length > 0 && <p className="text-sm text-slate-500">{summary(childGifts)}</p>}
            </div>

            {childGifts.length === 0 && (
              <Link
                href={`/gifts/new?child=${child.id}`}
                className="rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-500"
              >
                Aucun cadeau pour l&apos;instant — ajouter une idée
              </Link>
            )}

            {childGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} audience="parents" showOccasion={!occasion}>
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
                  {(gift.status === "BOUGHT" ? [] : GIFT_STATUSES.filter((s) => s !== gift.status)).map((status) => (
                    <form key={status} action={setGiftStatusAction.bind(null, gift.id, back)}>
                      <input type="hidden" name="status" value={status} />
                      <SubmitButton className="tap-target rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 active:bg-slate-200">
                        → {STATUS_LABEL[status]}
                      </SubmitButton>
                    </form>
                  ))}
                  <Link
                    href={`/gifts/${gift.id}`}
                    className="tap-target ml-auto flex items-center rounded-lg px-3 text-xs font-semibold text-brand-600"
                  >
                    Modifier
                  </Link>
                </div>
              </GiftCard>
            ))}
          </section>
        );
      })}
    </div>
  );
}
