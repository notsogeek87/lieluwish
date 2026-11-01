"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createGift, deleteGift, setGiftStatus, updateGift, type GiftInput } from "@/lib/data/gifts";
import { GIFT_STATUSES, normalizeGiftUrl, parsePriceToCents } from "@/lib/gifts";
import { redirectWithError } from "@/lib/actions";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));

const schema = z.object({
  childId: z.string().min(1, "Choisissez un enfant."),
  title: z.string().trim().min(1, "Le nom du cadeau est requis.").max(200),
  url: z.string().max(2000),
  price: z.string().max(20),
  occasion: optionalText(60),
  status: z.enum(GIFT_STATUSES),
  giver: optionalText(80),
  notes: optionalText(1000),
});

function parse(formData: FormData): GiftInput {
  const parsed = schema.safeParse({
    childId: formData.get("childId") ?? "",
    title: formData.get("title") ?? "",
    url: formData.get("url") ?? "",
    price: formData.get("price") ?? "",
    occasion: formData.get("occasion") ?? "",
    status: formData.get("status") ?? "IDEA",
    giver: formData.get("giver") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
  const { price, url, ...rest } = parsed.data;
  return {
    ...rest,
    url: normalizeGiftUrl(url),
    priceCents: parsePriceToCents(price),
    favorite: formData.get("favorite") === "on",
    hidden: formData.get("hidden") === "on",
  };
}

/** Back to the list, filtered on the gift's child so the parent sees what they just did. */
function listUrl(childId: string): string {
  return `/gifts?child=${encodeURIComponent(childId)}`;
}

export async function createGiftAction(formData: FormData): Promise<void> {
  let input: GiftInput;
  try {
    input = parse(formData);
    await createGift(input);
  } catch (error) {
    const child = String(formData.get("childId") ?? "");
    redirectWithError(`/gifts/new${child ? `?child=${encodeURIComponent(child)}` : ""}`, error);
  }
  revalidatePath("/", "layout");
  redirect(formData.get("another") === "1" ? `/gifts/new?child=${encodeURIComponent(input.childId)}&added=1` : listUrl(input.childId));
}

export async function updateGiftAction(giftId: string, formData: FormData): Promise<void> {
  let input: GiftInput;
  try {
    input = parse(formData);
    await updateGift(giftId, input);
  } catch (error) {
    redirectWithError(`/gifts/${giftId}`, error);
  }
  revalidatePath("/", "layout");
  redirect(listUrl(input.childId));
}

export async function deleteGiftAction(giftId: string, childId: string): Promise<void> {
  try {
    await deleteGift(giftId);
  } catch (error) {
    redirectWithError(`/gifts/${giftId}`, error);
  }
  revalidatePath("/", "layout");
  redirect(listUrl(childId));
}

const statusSchema = z.enum(GIFT_STATUSES);

/** Quick status change from the list; `back` is the list URL to return to. */
export async function setGiftStatusAction(giftId: string, back: string, formData: FormData): Promise<void> {
  const status = statusSchema.parse(formData.get("status"));
  await setGiftStatus(giftId, status);
  revalidatePath("/", "layout");
  // Only ever redirect inside the app.
  redirect(back.startsWith("/gifts") ? back : "/gifts");
}
