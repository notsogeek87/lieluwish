import Link from "next/link";
import { redirect } from "next/navigation";
import { listChildren } from "@/lib/data/children";
import { listOccasions } from "@/lib/data/gifts";
import { GiftFormFields } from "@/components/gift-form";
import { SubmitButton } from "@/components/submit-button";
import { Flash } from "@/components/flash";
import { defaultOccasion } from "@/lib/gifts";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/ui";
import { createGiftAction } from "../actions";

export default async function NewGiftPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; error?: string; added?: string; shared?: string; title?: string; url?: string }>;
}) {
  const [kids, occasions, params] = await Promise.all([listChildren(), listOccasions(), searchParams]);
  if (kids.length === 0) redirect("/children");

  return (
    <div className="flex flex-col gap-4">
      <Link href={params.child ? `/gifts?child=${encodeURIComponent(params.child)}` : "/gifts"} className="text-sm font-medium text-brand-600">
        ← Cadeaux
      </Link>
      <h1 className="text-xl font-bold text-slate-900">Nouveau cadeau</h1>
      <Flash
        error={params.error}
        success={
          params.added
            ? "Cadeau ajouté ✓ — vous pouvez en saisir un autre."
            : params.shared
              ? "Lien reçu ✓ — vérifiez le nom, choisissez l'enfant, puis ajoutez."
              : undefined
        }
      />

      <form action={createGiftAction} className="flex flex-col gap-4">
        <GiftFormFields
          kids={kids}
          defaultChildId={params.child}
          defaultOccasion={occasions[0] ?? defaultOccasion()}
          occasions={occasions}
          sharedTitle={params.title}
          sharedUrl={params.url}
        />
        <SubmitButton className={`${PRIMARY_BUTTON} mt-2`}>Ajouter le cadeau</SubmitButton>
        <button type="submit" name="another" value="1" className={SECONDARY_BUTTON}>
          Ajouter et en saisir un autre
        </button>
      </form>
    </div>
  );
}
