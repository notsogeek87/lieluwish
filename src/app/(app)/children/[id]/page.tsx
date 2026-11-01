import { notFound } from "next/navigation";
import Link from "next/link";
import { getChild } from "@/lib/data/children";
import { ColorPickerField } from "@/components/color-picker";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Flash } from "@/components/flash";
import { INPUT, PRIMARY_BUTTON } from "@/components/ui";
import { deleteChildAction, updateChildAction } from "../actions";

export default async function EditChildPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const child = await getChild(id);
  if (!child) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/children" className="text-sm font-medium text-brand-600">
        ← Les enfants
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{child.firstName}</h1>
      <Flash error={error} />

      <form action={updateChildAction.bind(null, child.id)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Prénom</span>
          <input name="firstName" required maxLength={60} defaultValue={child.firstName} className={INPUT} />
        </label>
        <ColorPickerField defaultValue={child.color} />
        <SubmitButton className={PRIMARY_BUTTON}>Enregistrer</SubmitButton>
      </form>

      <form action={deleteChildAction.bind(null, child.id)}>
        <ConfirmSubmitButton
          message={`Supprimer ${child.firstName} et tous ses cadeaux ?`}
          className="tap-target w-full rounded-xl px-4 py-3 text-sm font-semibold text-red-600"
        >
          Supprimer {child.firstName} et sa liste
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
