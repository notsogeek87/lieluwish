import "server-only";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { requireSession } from "@/lib/permissions";

export async function getMyFamilyName(): Promise<string> {
  const user = await requireSession();
  const row = await prisma.family.findUniqueOrThrow({ where: { id: user.familyId } });
  return decrypt(row.name);
}

export type FamilyMemberDTO = { id: string; name: string; email: string };

export async function listFamilyMembers(): Promise<FamilyMemberDTO[]> {
  const user = await requireSession();
  const rows = await prisma.user.findMany({ where: { familyId: user.familyId }, orderBy: { createdAt: "asc" } });
  return rows.map((row) => ({ id: row.id, name: decrypt(row.name), email: row.email }));
}

export type PendingInvitationDTO = { id: string; email: string; expiresAt: Date; token: string };

export async function listPendingInvitations(): Promise<PendingInvitationDTO[]> {
  const user = await requireSession();
  const rows = await prisma.invitation.findMany({
    where: { familyId: user.familyId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    expiresAt: row.expiresAt,
    token: decrypt(row.tokenEncrypted),
  }));
}

export async function cancelInvitation(id: string): Promise<void> {
  const user = await requireSession();
  await prisma.invitation.deleteMany({ where: { id, familyId: user.familyId, acceptedAt: null } });
}
