"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const raw = String(formData.get("callbackUrl") ?? "/gifts");
  // Only redirect inside the app (never to another site).
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/gifts";

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      const code = "code" in error && error.code === "rate_limited" ? "rate" : "1";
      redirect(`/login?error=${code}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}
