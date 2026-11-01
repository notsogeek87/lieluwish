import Link from "next/link";
import { listChildren } from "@/lib/data/children";
import { listGifts } from "@/lib/data/gifts";
import { ColorPickerField } from "@/components/color-picker";
import { SubmitButton } from "@/components/submit-button";
import { Flash } from "@/components/flash";
import { COLOR_PALETTE } from "@/lib/colors";
import { CARD, INPUT, PRIMARY_BUTTON, SECTION_TITLE } from "@/components/ui";
import { createChildAction } from "./actions";

export default async function ChildrenPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [children, gifts, { error }] = await Promise.all([listChildren(), listGifts(), searchParams]);
  const nextColor = COLOR_PALETTE[children.length % COLOR_PALETTE.length]!.value;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">Les enfants</h1>
      <Flash error={error} />

      {children.length > 0 && (
        <ul className="flex flex-col gap-2">
          {children.map((child) => {
            const count = gifts.filter((g) => g.childId === child.id).length;
            return (
              <li key={child.id}>
                <Link href={`/children/${child.id}`} className={`${CARD} flex items-center gap-3`}>
                  <span className="h-10 w-10 shrink-0 rounded-full" style={{ backgroundColor: child.color }} />
                  <span className="flex-1">
                    <span className="block font-semibold text-slate-900">{child.firstName}</span>
                    <span className="text-sm text-slate-500">
                      {count === 0 ? "Aucun cadeau" : `${count} cadeau${count > 1 ? "x" : ""}`}
                    </span>
                  </span>
                  <span className="text-sm text-slate-400">Modifier</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <section className={`${CARD} flex flex-col gap-4`}>
        <h2 className={SECTION_TITLE}>{children.length === 0 ? "Ajouter votre premier enfant" : "Ajouter un enfant"}</h2>
        <form action={createChildAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Prénom</span>
            <input name="firstName" required maxLength={60} className={INPUT} />
          </label>
          <ColorPickerField key={nextColor} defaultValue={nextColor} />
          <SubmitButton className={PRIMARY_BUTTON}>Ajouter</SubmitButton>
        </form>
      </section>
    </div>
  );
}
