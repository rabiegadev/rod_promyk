import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

export function forbidden() {
  return Response.json({ error: "Brak uprawnień." }, { status: 403 });
}

export function unauthorized() {
  return Response.json({ error: "Wymagane logowanie." }, { status: 401 });
}

export function requireSession(session: Session | null): session is Session {
  return Boolean(session?.user?.id);
}

export function requireRoles(session: Session | null, roles: Role[]) {
  if (!requireSession(session)) return false;
  return roles.includes(session.user.role);
}
