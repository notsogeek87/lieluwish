"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createShareLink, revokeShareLink } from "@/lib/data/shareLinks";

export async function createShareLinkAction(): Promise<void> {
  await createShareLink();
  revalidatePath("/sharing");
  redirect("/sharing?created=1");
}

export async function revokeShareLinkAction(id: string): Promise<void> {
  await revokeShareLink(id);
  revalidatePath("/sharing");
  redirect("/sharing");
}
