import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { AuthHeader } from "@/components/auth-header";
import { INPUT, PRIMARY_BUTTON } from "@/components/ui";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/gifts";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <AuthHeader title="Lieluwish" subtitle="Les listes de cadeaux des enfants" />

      <form action={loginAction} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {params.error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">Email ou mot de passe incorrect.</p>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input type="email" name="email" required autoComplete="email" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Mot de passe</span>
          <input type="password" name="password" required autoComplete="current-password" className={INPUT} />
        </label>
        <SubmitButton className={`${PRIMARY_BUTTON} mt-2`}>Se connecter</SubmitButton>
      </form>

      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-brand-600">
          Créer notre famille
        </Link>
      </p>
    </main>
  );
}
