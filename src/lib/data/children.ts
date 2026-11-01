import "server-only";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { assertSameFamily, requireSession } from "@/lib/permissions";
import { toChildDTO, type ChildDTO } from "@/lib/data/dto";

export type ChildInput = { firstName: string; color: string };

export async function listChildren(): Promise<ChildDTO[]> {
  const user = await requireSession();
  return listChildrenForFamily(user.familyId);
}

/**
 * No session check — for the public /share/[token] page ONLY, where the
 * family id comes from a valid, non-revoked ShareLink. Never call this with
 * a caller-supplied familyId.
 */
export async function listChildrenForFamily(familyId: string): Promise<ChildDTO[]> {
  const rows = await prisma.child.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } });
  return rows.map(toChildDTO);
}

export async function getChild(childId: string): Promise<ChildDTO | null> {
  const user = await requireSession();
  const row = await prisma.child.findUnique({ where: { id: childId } });
  if (!row) return null;
  assertSameFamily(user, row.familyId);
  return toChildDTO(row);
}

export async function createChild(input: ChildInput): Promise<ChildDTO> {
  const user = await requireSession();
  const row = await prisma.child.create({
    data: { familyId: user.familyId, firstName: encrypt(input.firstName), color: input.color },
  });
  return toChildDTO(row);
}

export async function updateChild(childId: string, input: ChildInput): Promise<void> {
  const user = await requireSession();
  const existing = await prisma.child.findUniqueOrThrow({ where: { id: childId } });
  assertSameFamily(user, existing.familyId);
  await prisma.child.update({
    where: { id: childId },
    data: { firstName: encrypt(input.firstName), color: input.color },
  });
}

/** Also deletes the child's gifts (onDelete: Cascade). */
export async function deleteChild(childId: string): Promise<void> {
  const user = await requireSession();
  const existing = await prisma.child.findUniqueOrThrow({ where: { id: childId } });
  assertSameFamily(user, existing.familyId);
  await prisma.child.delete({ where: { id: childId } });
}
