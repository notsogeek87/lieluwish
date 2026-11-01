import "server-only";
import type { GiftStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { encrypt, encryptNullable } from "@/lib/crypto";
import { assertSameFamily, requireSession, type SessionUser } from "@/lib/permissions";
import { toGiftDTO, type GiftDTO } from "@/lib/data/dto";
import { compareGifts } from "@/lib/gifts";

export type GiftInput = {
  childId: string;
  title: string;
  url: string | null;
  priceCents: number | null;
  occasion: string | null;
  status: GiftStatus;
  giver: string | null;
  notes: string | null;
  favorite: boolean;
  hidden: boolean;
};

function sorted(rows: GiftDTO[]): GiftDTO[] {
  return rows.sort(compareGifts);
}

export async function listGifts(): Promise<GiftDTO[]> {
  const user = await requireSession();
  const rows = await prisma.gift.findMany({ where: { familyId: user.familyId } });
  return sorted(rows.map(toGiftDTO));
}

/**
 * No session check — for the public /share/[token] page ONLY (family id
 * authorized by a valid ShareLink). Gifts marked `hidden` are never
 * returned, and neither are the parents' private notes.
 */
export async function listPublicGiftsForFamily(familyId: string): Promise<Omit<GiftDTO, "notes">[]> {
  const rows = await prisma.gift.findMany({ where: { familyId, hidden: false } });
  // Grandparents look for what is still free: available gifts first.
  const free = (g: GiftDTO) => (g.status === "IDEA" ? 0 : 1);
  return sorted(rows.map(toGiftDTO))
    .sort((a, b) => free(a) - free(b))
    .map(({ notes: _notes, ...gift }) => gift);
}

export async function getGift(giftId: string): Promise<GiftDTO | null> {
  const user = await requireSession();
  const row = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!row) return null;
  assertSameFamily(user, row.familyId);
  return toGiftDTO(row);
}

async function assertChildInFamily(user: SessionUser, childId: string): Promise<void> {
  const count = await prisma.child.count({ where: { id: childId, familyId: user.familyId } });
  if (count !== 1) throw new Error("Cet enfant n'appartient pas à votre famille.");
}

function encryptInput(input: GiftInput) {
  return {
    childId: input.childId,
    title: encrypt(input.title),
    url: encryptNullable(input.url),
    priceCents: input.priceCents,
    occasion: encryptNullable(input.occasion),
    status: input.status,
    giver: encryptNullable(input.giver),
    notes: encryptNullable(input.notes),
    favorite: input.favorite,
    hidden: input.hidden,
  };
}

export async function createGift(input: GiftInput): Promise<void> {
  const user = await requireSession();
  await assertChildInFamily(user, input.childId);
  await prisma.gift.create({ data: { familyId: user.familyId, ...encryptInput(input) } });
}

export async function updateGift(giftId: string, input: GiftInput): Promise<void> {
  const user = await requireSession();
  const existing = await prisma.gift.findUniqueOrThrow({ where: { id: giftId } });
  assertSameFamily(user, existing.familyId);
  await assertChildInFamily(user, input.childId);
  await prisma.gift.update({ where: { id: giftId }, data: encryptInput(input) });
}

export async function setGiftStatus(giftId: string, status: GiftStatus): Promise<void> {
  const user = await requireSession();
  const existing = await prisma.gift.findUniqueOrThrow({ where: { id: giftId } });
  assertSameFamily(user, existing.familyId);
  await prisma.gift.update({ where: { id: giftId }, data: { status } });
}

export async function deleteGift(giftId: string): Promise<void> {
  const user = await requireSession();
  const existing = await prisma.gift.findUniqueOrThrow({ where: { id: giftId } });
  assertSameFamily(user, existing.familyId);
  await prisma.gift.delete({ where: { id: giftId } });
}

/** Distinct occasions already used in the family, for the form's suggestions. */
export async function listOccasions(): Promise<string[]> {
  const gifts = await listGifts();
  return [...new Set(gifts.map((g) => g.occasion).filter((o): o is string => Boolean(o)))].sort();
}
