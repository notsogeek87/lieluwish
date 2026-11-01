import { requireSession } from "@/lib/permissions";
import { getMyFamilyName, listFamilyMembers, listPendingInvitations } from "@/lib/data/family";
import { getAppUrl } from "@/lib/url";
import { InstallPwaHint } from "@/components/install-pwa-hint";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareLinkButton } from "@/components/share-link-button";
import { SubmitButton } from "@/components/submit-button";
import { Flash } from "@/components/flash";
import { CARD, INPUT, SECTION_TITLE } from "@/components/ui";
import {
  cancelInvitationAction,
  changePasswordAction,
  inviteParentAction,
  renameFamilyAction,
} from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; invited?: string }>;
}) {
  const user = await requireSession();
  const [familyName, members, invitations, appUrl, params] = await Promise.all([
    getMyFamilyName(),
    listFamilyMembers(),
    listPendingInvitations(),
    getAppUrl(),
    searchParams,
  ]);
  const me = members.find((m) => m.id === user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">Réglages</h1>
      <Flash
        error={params.error}
        success={
          params.invited
            ? "Invitation créée ✓ — envoyez le lien ci-dessous."
            : params.success
              ? "Modifications enregistrées."
              : undefined
        }
      />

      <section className={`${CARD} flex flex-col gap-3`}>
        <h2 className={SECTION_TITLE}>Les parents</h2>
        <ul className="flex flex-col gap-1">
          {members.map((m) => (
            <li key={m.id} className="text-slate-900">
              {m.name} <span className="text-sm text-slate-500">· {m.email}</span>
            </li>
          ))}
        </ul>

        {invitations.map((inv) => {
          const url = `${appUrl}/invite/${inv.token}`;
          return (
            <div key={inv.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-700">
                Invitation en attente : <strong>{inv.email}</strong>
                <span className="text-slate-500"> (expire le {inv.expiresAt.toLocaleDateString("fr-FR")})</span>
              </p>
              <p className="break-all text-xs text-slate-500">{url}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyLinkButton link={url} />
                <ShareLinkButton link={url} text="Rejoins-moi sur Lieluwish pour gérer les cadeaux des enfants" />
                <form action={cancelInvitationAction.bind(null, inv.id)} className="ml-auto">
                  <SubmitButton className="tap-target px-2 text-xs font-medium text-red-600">Annuler</SubmitButton>
                </form>
              </div>
            </div>
          );
        })}

        <form action={inviteParentAction} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Inviter l&apos;autre parent (email)</span>
            <input type="email" name="email" required className={INPUT} />
          </label>
          <SubmitButton className="tap-target rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white active:bg-slate-800">
            Créer le lien d&apos;invitation
          </SubmitButton>
          <p className="text-xs text-slate-500">
            Un lien personnel, valable 7 jours, à lui envoyer : il ou elle créera son mot de passe et aura les
            mêmes droits que vous.
          </p>
        </form>
      </section>

      <section className={`${CARD} flex flex-col gap-3`}>
        <h2 className={SECTION_TITLE}>Nom de la famille</h2>
        <form action={renameFamilyAction} className="flex gap-2">
          <input name="name" defaultValue={familyName} required maxLength={100} className={`${INPUT} min-w-0 flex-1`} />
          <SubmitButton className="tap-target rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white">OK</SubmitButton>
        </form>
      </section>

      <section className={`${CARD} flex flex-col gap-3`}>
        <h2 className={SECTION_TITLE}>Mon mot de passe</h2>
        {me && <p className="text-sm text-slate-500">{me.email}</p>}
        <form action={changePasswordAction} className="flex flex-col gap-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Mot de passe actuel"
            required
            autoComplete="current-password"
            className={INPUT}
          />
          <input
            type="password"
            name="newPassword"
            placeholder="Nouveau mot de passe"
            required
            minLength={8}
            autoComplete="new-password"
            className={INPUT}
          />
          <SubmitButton className="tap-target rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white active:bg-slate-800">
            Changer le mot de passe
          </SubmitButton>
        </form>
      </section>

      <section className={`${CARD} flex flex-col gap-3`}>
        <h2 className={SECTION_TITLE}>Application</h2>
        <InstallPwaHint />
      </section>
    </div>
  );
}
