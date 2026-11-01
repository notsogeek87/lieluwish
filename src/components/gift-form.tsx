import type { ChildDTO, GiftDTO } from "@/lib/data/dto";
import { GIFT_STATUSES, STATUS_LABEL, priceInputValue } from "@/lib/gifts";
import { INPUT } from "@/components/ui";

/** Fields shared by the "new gift" and "edit gift" forms (the <form> and buttons live in the page). */
export function GiftFormFields({
  kids,
  gift,
  defaultChildId,
  defaultOccasion,
  occasions,
}: {
  kids: ChildDTO[];
  gift?: GiftDTO;
  defaultChildId?: string;
  defaultOccasion: string;
  occasions: string[];
}) {
  const childId = gift?.childId ?? defaultChildId ?? kids[0]?.id;

  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-slate-700">Pour</legend>
        <div className="flex flex-wrap gap-2">
          {kids.map((child) => (
            <label key={child.id} className="cursor-pointer">
              <input
                type="radio"
                name="childId"
                value={child.id}
                defaultChecked={child.id === childId}
                required
                className="peer sr-only"
              />
              <span
                className="tap-target flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 peer-checked:border-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200"
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: child.color }} />
                {child.firstName}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Cadeau</span>
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={gift?.title}
          placeholder="Ex. : vélo rouge 16 pouces"
          className={INPUT}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Lien (optionnel)</span>
        <input
          name="url"
          type="text"
          inputMode="url"
          maxLength={2000}
          defaultValue={gift?.url ?? ""}
          placeholder="https://…"
          className={INPUT}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Prix (€)</span>
          <input
            name="price"
            inputMode="decimal"
            maxLength={20}
            defaultValue={priceInputValue(gift?.priceCents)}
            placeholder="29,99"
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Occasion</span>
          <input
            name="occasion"
            list="occasions"
            maxLength={60}
            defaultValue={gift ? (gift.occasion ?? "") : defaultOccasion}
            className={INPUT}
          />
          <datalist id="occasions">
            {[...new Set([defaultOccasion, ...occasions, "Anniversaire"])].map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-slate-700">Où en est-on ?</legend>
        <div className="grid grid-cols-3 gap-2">
          {GIFT_STATUSES.map((status) => (
            <label key={status} className="cursor-pointer">
              <input
                type="radio"
                name="status"
                value={status}
                defaultChecked={(gift?.status ?? "IDEA") === status}
                className="peer sr-only"
              />
              <span className="tap-target flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-700 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-700">
                {STATUS_LABEL[status]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Offert par (optionnel)</span>
        <input
          name="giver"
          maxLength={80}
          defaultValue={gift?.giver ?? ""}
          placeholder="Ex. : Papi et Mamie"
          className={INPUT}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Notes privées (optionnel)</span>
        <textarea
          name="notes"
          rows={2}
          maxLength={1000}
          defaultValue={gift?.notes ?? ""}
          placeholder="Taille, couleur, magasin… (jamais visible sur le lien de partage)"
          className={INPUT}
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input type="checkbox" name="favorite" defaultChecked={gift?.favorite} className="h-5 w-5 accent-brand-600" />
        ❤️ Coup de cœur
      </label>
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input type="checkbox" name="hidden" defaultChecked={gift?.hidden} className="h-5 w-5 accent-brand-600" />
        🙈 Ne pas montrer sur le lien de partage (surprise)
      </label>
    </>
  );
}
