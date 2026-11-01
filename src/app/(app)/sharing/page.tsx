import Link from "next/link";
import { listShareLinks } from "@/lib/data/shareLinks";
import { getAppUrl } from "@/lib/url";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareLinkButton } from "@/components/share-link-button";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Flash } from "@/components/flash";
import { CARD, PRIMARY_BUTTON, SECTION_TITLE } from "@/components/ui";
import { createShareLinkAction, revokeShareLinkAction } from "./actions";

export default async function SharingPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const [links, appUrl, { created }] = await Promise.all([listShareLinks(), getAppUrl(), searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">Partager avec les grands-parents</h1>
      <Flash success={created ? "Lien créé ✓ — copiez-le ou envoyez-le." : undefined} />

      <section className={`${CARD} flex flex-col gap-3`}>
        <h2 className={SECTION_TITLE}>Lien de consultation</h2>
        <p className="text-sm text-slate-600">
          Un lien à envoyer aux grands-parents (ou à la famille) : ils voient les listes de cadeaux de
          chaque enfant, avec ce qui est <strong>encore disponible</strong> et ce qui est{" "}
          <strong>déjà prévu</strong>, sans créer de compte. Ils ne peuvent rien modifier.
        </p>
        <ul className="list-inside list-disc text-sm text-slate-500">
          <li>Vos notes privées ne sont jamais affichées.</li>
          <li>Les cadeaux marqués 🙈 « surprise » sont masqués.</li>
          <li>Révocable à tout moment : le lien cesse alors de fonctionner.</li>
        </ul>

        {links.map((link) => {
          const url = `${appUrl}/share/${link.token}`;
          return (
            <div key={link.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3">
              <p className="break-all text-xs text-slate-500">{url}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyLinkButton link={url} />
                <ShareLinkButton link={url} text="La liste de cadeaux des enfants 🎁" />
                <Link
                  href={`/share/${link.token}`}
                  target="_blank"
                  className="tap-target flex items-center rounded-lg px-3 text-xs font-semibold text-slate-700"
                >
                  Aperçu ↗
                </Link>
                <form action={revokeShareLinkAction.bind(null, link.id)} className="ml-auto">
                  <ConfirmSubmitButton
                    message="Révoquer ce lien ? Les personnes qui l'ont ne pourront plus consulter les listes."
                    className="tap-target px-2 text-xs font-medium text-red-600"
                  >
                    Révoquer
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}

        <form action={createShareLinkAction}>
          <SubmitButton className={`${PRIMARY_BUTTON} w-full`}>
            {links.length === 0 ? "Créer le lien de partage" : "+ Créer un autre lien"}
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
