// Données de démonstration : npm run seed (jamais sur une base de production).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encrypt } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  await prisma.user.deleteMany({ where: { email: { endsWith: "@demo.lieluwish.app" } } });

  const family = await prisma.family.create({ data: { name: encrypt("Famille Démo") } });
  await prisma.user.createMany({
    data: [
      { email: "papa@demo.lieluwish.app", passwordHash, name: encrypt("Papa"), familyId: family.id },
      { email: "maman@demo.lieluwish.app", passwordHash, name: encrypt("Maman"), familyId: family.id },
    ],
  });

  const leo = await prisma.child.create({ data: { familyId: family.id, firstName: encrypt("Léo"), color: "#2563eb" } });
  const emma = await prisma.child.create({ data: { familyId: family.id, firstName: encrypt("Emma"), color: "#db2777" } });

  const gift = (childId: string, title: string, extra: Partial<{ priceCents: number; status: "IDEA" | "PLANNED" | "BOUGHT"; giver: string; favorite: boolean; url: string }> = {}) => ({
    familyId: family.id,
    childId,
    title: encrypt(title),
    occasion: encrypt("Noël 2026"),
    priceCents: extra.priceCents ?? null,
    status: extra.status ?? "IDEA",
    giver: extra.giver ? encrypt(extra.giver) : null,
    url: extra.url ? encrypt(extra.url) : null,
    favorite: extra.favorite ?? false,
  });

  await prisma.gift.createMany({
    data: [
      gift(leo.id, "LEGO Ninjago — Le dragon de Lloyd", { priceCents: 4999, favorite: true, url: "https://www.lego.com/fr-fr/themes/ninjago" }),
      gift(leo.id, "Vélo 16 pouces", { priceCents: 17900, status: "PLANNED", giver: "Papi et Mamie" }),
      gift(leo.id, "Livre : Les Cinq Ninjas", { priceCents: 1290, status: "BOUGHT", giver: "Tata Julie" }),
      gift(emma.id, "Peluche licorne", { priceCents: 2500, favorite: true }),
      gift(emma.id, "Kit de perles", { priceCents: 1999 }),
    ],
  });

  console.log("Démo prête : papa@demo.lieluwish.app / Demo1234!");
}

main().finally(() => prisma.$disconnect());
