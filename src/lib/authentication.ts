import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function redirectIfSign() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
}

export async function requireSession(redirectTo: string) {
  const session = await getSession();
  if (!session?.user) {
    const next = redirectTo ? `?next=${redirectTo}` : "";
    redirect("/sign-in" + next);
  }
  return session;
}
