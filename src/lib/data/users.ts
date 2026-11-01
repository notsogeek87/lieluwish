import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export type RegisterFamilyInput = {
  familyName: string;
  parentName: string;
  email: string;
  password: string;
};

/**
 * Creates a brand-new family with its first parent. Nobody ever joins a
 * family by knowing its id: the other parent arrives through an Invitation.
 */
export async function registerFamily(input: RegisterFamilyInput) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Un compte existe déjà avec cet email.");

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const family = await tx.family.create({ data: { name: encrypt(input.familyName) } });
    const user = await tx.user.create({
      data: { email, passwordHash, name: encrypt(input.parentName), familyId: family.id },
    });
    return { familyId: family.id, userId: user.id };
  });
}
