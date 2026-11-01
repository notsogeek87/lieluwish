import { getInvitationPreview } from "@/lib/data/invitations";
import { SubmitButton } from "@/components/submit-button";
import { AuthHeader } from "@/components/auth-header";
import { Flash } from "@/components/flash";
import { INPUT, PRIMARY_BUTTON } from "@/components/ui";
import { acceptInvitationAction } from "./actions";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const invitation = await getInvitationPreview(token);

  if (!invitation || !invitation.valid) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3 px-6 text-center">
        <AuthHeader title="Invitation invalide ou expirée" subtitle="Demandez une nouvelle invitation." />
      </main>
    );
  }

  const action = acceptInvitationAction.bind(null, token);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <AuthHeader title={`Rejoindre ${invitation.familyName}`} subtitle="Vous pourrez gérer les cadeaux des enfants." />

      <form action={action} className="flex flex-col gap-4">
        <Flash error={error} />
        <p className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">{invitation.email}</p>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Votre prénom</span>
          <input name="name" required className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Choisir un mot de passe (8 caractères minimum)</span>
          <input type="password" name="password" required minLength={8} autoComplete="new-password" className={INPUT} />
        </label>
        <SubmitButton className={`${PRIMARY_BUTTON} mt-2`}>Rejoindre la famille</SubmitButton>
      </form>
    </main>
  );
}
