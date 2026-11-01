import type { Child, Gift } from "@prisma/client";
import { decrypt, decryptNullable } from "@/lib/crypto";

export type ChildDTO = { id: string; familyId: string; firstName: string; color: string };

export function toChildDTO(row: Child): ChildDTO {
  return { id: row.id, familyId: row.familyId, firstName: decrypt(row.firstName), color: row.color };
}

export type GiftDTO = {
  id: string;
  familyId: string;
  childId: string;
  title: string;
  url: string | null;
  priceCents: number | null;
  occasion: string | null;
  status: Gift["status"];
  giver: string | null;
  notes: string | null;
  favorite: boolean;
  hidden: boolean;
  createdAt: Date;
};

export function toGiftDTO(row: Gift): GiftDTO {
  return {
    id: row.id,
    familyId: row.familyId,
    childId: row.childId,
    title: decrypt(row.title),
    url: decryptNullable(row.url),
    priceCents: row.priceCents,
    occasion: decryptNullable(row.occasion),
    status: row.status,
    giver: decryptNullable(row.giver),
    notes: decryptNullable(row.notes),
    favorite: row.favorite,
    hidden: row.hidden,
    createdAt: row.createdAt,
  };
}
