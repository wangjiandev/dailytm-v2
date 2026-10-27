import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import * as organizationService from "@/server/services/organization";
import { OrgContext } from "@/lib/validations/auth";
import { cache } from "react";
import { resolveOrgContext } from "./authz";

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

export type ActiveOrganization = {
  session: Awaited<ReturnType<typeof requireSession>>;
  organization: Awaited<ReturnType<typeof organizationService.bySlug>>;
  ctx: OrgContext;
};

export const requireActiveOrganization = cache(
  async function requireActiveOrganization(
    orgSlug: string,
    path: string,
  ): Promise<ActiveOrganization> {
    const session = await requireSession(path);
    const protectedCtx = { session, userId: session.user.id };
    const organization = await organizationService
      .bySlug(protectedCtx, {
        slug: orgSlug,
      })
      .catch(() => null);
    if (!organization) notFound();

    if (session.session.activeOrganizationId !== organization.id) {
      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationId: organization.id,
        },
      });

      const pathname = (await headers()).get("x-pathname") ?? path;
      redirect(pathname);
    }

    return {
      session,
      organization,
      ctx: await resolveOrgContext(protectedCtx),
    };
  },
);
