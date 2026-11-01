"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { hashPassword } from "@/lib/data/users";
import { encrypt } from "@/lib/crypto";
import { createInvitation } from "@/lib/data/invitations";
import { cancelInvitation } from "@/lib/data/family";
import { redirectWithError } from "@/lib/actions";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
});

export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await requireSession();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) redirectWithError("/settings", new Error(parsed.error.issues[0]?.message));

  const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(parsed.data.currentPassword, row.passwordHash))) {
    redirectWithError("/settings", new Error("Mot de passe actuel incorrect."));
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  redirect("/settings?success=1");
}

const familyNameSchema = z.object({ name: z.string().trim().min(1, "Le nom de la famille est requis.").max(100) });

export async function renameFamilyAction(formData: FormData): Promise<void> {
  const user = await requireSession();
  const parsed = familyNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) redirectWithError("/settings", new Error(parsed.error.issues[0]?.message));

  await prisma.family.update({ where: { id: user.familyId }, data: { name: encrypt(parsed.data.name) } });
  revalidatePath("/", "layout");
  redirect("/settings?success=1");
}

const inviteSchema = z.object({ email: z.string().trim().email("Email invalide.") });

export async function inviteParentAction(formData: FormData): Promise<void> {
  try {
    const { email } = inviteSchema.parse({ email: formData.get("email") });
    await createInvitation(email);
  } catch (error) {
    redirectWithError("/settings", error);
  }
  revalidatePath("/settings");
  redirect("/settings?invited=1");
}

export async function cancelInvitationAction(id: string): Promise<void> {
  await cancelInvitation(id);
  revalidatePath("/settings");
  redirect("/settings");
}
