import Image from "next/image";
import { logoutAction } from "@/app/(app)/logout-action";
import { SubmitButton } from "@/components/submit-button";

export function TopBar({ familyName }: { familyName: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Lieluwish" width={32} height={32} className="rounded-lg" />
        <p className="text-sm font-semibold text-slate-900">{familyName}</p>
      </div>
      <form action={logoutAction}>
        <SubmitButton className="tap-target rounded-lg px-3 py-2 text-sm font-medium text-slate-500">
          Déconnexion
        </SubmitButton>
      </form>
    </header>
  );
}
