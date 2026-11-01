import { redirect } from "next/navigation";
import { requireSession, UnauthorizedError } from "@/lib/permissions";
import { getMyFamilyName } from "@/lib/data/family";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Middleware is the primary gate; this is a defense-in-depth fallback.
  try {
    await requireSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login");
    throw error;
  }

  const familyName = await getMyFamilyName();

  return (
    <div className="min-h-screen pb-20">
      <TopBar familyName={familyName} />
      <div className="mx-auto max-w-lg px-4 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}
