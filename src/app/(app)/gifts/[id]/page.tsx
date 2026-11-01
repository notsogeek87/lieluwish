import Link from "next/link";
import { notFound } from "next/navigation";
import { listChildren } from "@/lib/data/children";
import { getGift, listOccasions } from "@/lib/data/gifts";
import { GiftFormFields } from "@/components/gift-form";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Flash } from "@/components/flash";
import { defaultOccasion } from "@/lib/gifts";
import { PRIMARY_BUTTON } from "@/components/ui";
import { deleteGiftAction, updateGiftAction } from "../actions";

export default async function EditGiftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const [gift, kids, occasions, { error }] = await Promise.all([getGift(id), listChildren(), listOccasions(), searchParams]);
  if (!gift) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/gifts?child=${gift.childId}`} className="text-sm font-medium text-brand-600">
        ← Cadeaux
      </Link>
      <h1 className="text-xl font-bold text-slate-900">Modifier le cadeau</h1>
      <Flash error={error} />

      <form action={updateGiftAction.bind(null, gift.id)} className="flex flex-col gap-4">
        <GiftFormFields kids={kids} gift={gift} defaultOccasion={defaultOccasion()} occasions={occasions} />
        <SubmitButton className={`${PRIMARY_BUTTON} mt-2`}>Enregistrer</SubmitButton>
      </form>

      <form action={deleteGiftAction.bind(null, gift.id, gift.childId)}>
        <ConfirmSubmitButton
          message={`Supprimer « ${gift.title} » ?`}
          className="tap-target w-full rounded-xl px-4 py-3 text-sm font-semibold text-red-600"
        >
          Supprimer ce cadeau
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
