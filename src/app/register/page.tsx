import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { AuthHeader } from "@/components/auth-header";
import { Flash } from "@/components/flash";
import { INPUT, PRIMARY_BUTTON } from "@/components/ui";
import { registrationOpen } from "@/lib/rate-limit";
import { registerAction } from "./actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  if (!registrationOpen()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12 text-center">
        <AuthHeader
          title="Inscriptions fermées"
          subtitle="Pour rejoindre une famille, demandez une invitation à un parent."
        />
        <Link href="/login" className="font-medium text-brand-600">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <AuthHeader
        title="Créer notre famille"
        subtitle="Vous pourrez ensuite inviter l'autre parent."
      />

      <form action={registerAction} className="flex flex-col gap-4">
        <Flash error={params.error} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Nom de la famille</span>
          <input name="familyName" required placeholder="Famille Dupont" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Votre prénom</span>
          <input name="parentName" required className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input type="email" name="email" required autoComplete="email" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Mot de passe (8 caractères minimum)</span>
          <input type="password" name="password" required minLength={8} autoComplete="new-password" className={INPUT} />
        </label>
        <SubmitButton className={`${PRIMARY_BUTTON} mt-2`}>Créer notre famille</SubmitButton>
      </form>

      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
