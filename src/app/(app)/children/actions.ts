"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createChild, deleteChild, updateChild } from "@/lib/data/children";
import { redirectWithError } from "@/lib/actions";

const schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(60),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

function parse(formData: FormData) {
  const parsed = schema.safeParse({ firstName: formData.get("firstName"), color: formData.get("color") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
  return parsed.data;
}

export async function createChildAction(formData: FormData): Promise<void> {
  try {
    await createChild(parse(formData));
  } catch (error) {
    redirectWithError("/children", error);
  }
  revalidatePath("/", "layout");
  redirect("/children");
}

export async function updateChildAction(childId: string, formData: FormData): Promise<void> {
  try {
    await updateChild(childId, parse(formData));
  } catch (error) {
    redirectWithError(`/children/${childId}`, error);
  }
  revalidatePath("/", "layout");
  redirect("/children");
}

export async function deleteChildAction(childId: string): Promise<void> {
  try {
    await deleteChild(childId);
  } catch (error) {
    redirectWithError(`/children/${childId}`, error);
  }
  revalidatePath("/", "layout");
  redirect("/children");
}
