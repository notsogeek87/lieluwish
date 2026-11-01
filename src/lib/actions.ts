import "server-only";
import { redirect } from "next/navigation";

/** Server-action helper: back to `path` with the error message in the query string. */
export function redirectWithError(path: string, error: unknown): never {
  const message =
    error instanceof Error && error.name === "ZodError"
      ? "Formulaire invalide."
      : error instanceof Error
        ? error.message
        : "Une erreur est survenue.";
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}error=${encodeURIComponent(message)}`);
}
