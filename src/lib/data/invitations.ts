import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt, hashToken } from "@/lib/crypto";
import { requireSession } from "@/lib/permissions";
import { hashPassword } from "@/lib/data/users";

const INVITATION_TTL_DAYS = 7;

/** Invites the other parent by email (single-use link, valid 7 days). */
export async function createInvitation(rawEmail: string) {
  const user = await requireSession();
  const email = rawEmail.toLowerCase().trim();

  const alreadyMember = await prisma.user.findUnique({ where: { email } });
  if (alreadyMember) throw new Error("Cette personne a déjà un compte.");

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      familyId: user.familyId,
      email,
      tokenHash: hashToken(token),
      tokenEncrypted: encrypt(token),
      invitedBy: user.id,
      expiresAt,
    },
  });
  return { token };
}

export type InvitationPreview = { email: string; familyName: string; valid: boolean };

export async function getInvitationPreview(token: string): Promise<InvitationPreview | null> {
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { family: true },
  });
  if (!invitation) return null;
  return {
    email: invitation.email,
    familyName: decrypt(invitation.family.name),
    valid: !invitation.acceptedAt && invitation.expiresAt > new Date(),
  };
}

export async function acceptInvitation(input: { token: string; name: string; password: string }) {
  const invitation = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(input.token) } });
  if (!invitation) throw new Error("Invitation introuvable.");
  if (invitation.acceptedAt) throw new Error("Cette invitation a déjà été utilisée.");
  if (invitation.expiresAt < new Date()) throw new Error("Cette invitation a expiré.");

  const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existing) throw new Error("Un compte existe déjà avec cet email.");

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    // Conditional update: two concurrent accepts cannot both succeed.
    const claimed = await tx.invitation.updateMany({
      where: { id: invitation.id, acceptedAt: null },
      data: { acceptedAt: new Date() },
    });
    if (claimed.count !== 1) throw new Error("Cette invitation a déjà été utilisée.");
    return tx.user.create({
      data: { email: invitation.email, passwordHash, name: encrypt(input.name), familyId: invitation.familyId },
    });
  });

  return { email: user.email };
}
