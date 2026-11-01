import "server-only";
import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Vous devez être connecté.");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Cette ressource n'appartient pas à votre famille.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  familyId: string;
};

/**
 * Every server action / data function that touches family data MUST go
 * through this. Only the parents have an account: grandparents never log
 * in, they consult through a read-only share link (/share/[token]).
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session.user as SessionUser;
}

/**
 * Strict family isolation: a resource's familyId must match the session's
 * familyId, or the request is rejected. Call this before returning or
 * mutating any row that carries a familyId.
 */
export function assertSameFamily(user: SessionUser, resourceFamilyId: string): void {
  if (user.familyId !== resourceFamilyId) throw new ForbiddenError();
}
