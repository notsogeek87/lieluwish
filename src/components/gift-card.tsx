import { formatPrice, linkLabel, PUBLIC_STATUS_LABEL, STATUS_LABEL, type GiftStatusValue } from "@/lib/gifts";

const STATUS_STYLE: Record<GiftStatusValue, string> = {
  IDEA: "bg-sky-100 text-sky-800",
  PLANNED: "bg-amber-100 text-amber-800",
  BOUGHT: "bg-green-100 text-green-800",
};

export type GiftCardData = {
  title: string;
  url: string | null;
  priceCents: number | null;
  occasion: string | null;
  status: GiftStatusValue;
  giver: string | null;
  favorite: boolean;
  hidden?: boolean;
  notes?: string | null;
};

/**
 * One gift. `audience="public"` is the grandparents' wording (and never
 * receives private notes or hidden gifts — see listPublicGiftsForFamily).
 */
export function GiftCard({
  gift,
  audience,
  showOccasion,
  children,
}: {
  gift: GiftCardData;
  audience: "parents" | "public";
  showOccasion: boolean;
  children?: React.ReactNode;
}) {
  const taken = gift.status !== "IDEA";
  const bought = gift.status === "BOUGHT";
  const label = audience === "public" ? PUBLIC_STATUS_LABEL[gift.status] : STATUS_LABEL[gift.status];

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 shadow-sm ${
        bought ? "bg-slate-100 opacity-70" : audience === "public" && taken ? "bg-white opacity-75" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-2">
        <p className={`flex-1 font-semibold text-slate-900 ${audience === "public" && taken ? "line-through decoration-slate-400" : ""}`}>
          {gift.favorite && <span aria-label="Coup de cœur">❤️ </span>}
          {gift.title}
        </p>
        {audience === "parents" && gift.hidden && (
          <span
            className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800"
            title="Surprise : non visible sur le lien de partage"
          >
            🙈 Surprise
          </span>
        )}
        {gift.priceCents !== null && (
          <span className="shrink-0 font-semibold text-slate-700">{formatPrice(gift.priceCents)}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className={`rounded-full px-2.5 py-0.5 font-medium ${STATUS_STYLE[gift.status]}`}>{label}</span>
        {gift.giver && <span className="text-slate-600">par {gift.giver}</span>}
        {showOccasion && gift.occasion && <span className="text-slate-500">· {gift.occasion}</span>}
      </div>

      {gift.notes && <p className="whitespace-pre-line text-sm text-slate-500">{gift.notes}</p>}

      {gift.url && (
        <a
          href={gift.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="self-start text-sm font-medium text-brand-600 underline underline-offset-2"
        >
          Voir sur {linkLabel(gift.url)} ↗
        </a>
      )}

      {children}
    </div>
  );
}
