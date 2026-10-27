import "server-only";
import { ProtectedContext } from "@/lib/validations/auth";
import db from "@/lib/db";
import { TRPCError } from "@trpc/server";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string;
  memberCount: number;
};

export async function listForUser(
  ctx: ProtectedContext,
): Promise<OrganizationSummary[]> {
  const memberships = await db.member.findMany({
    where: {
      userId: ctx.userId,
    },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map(({ role, organization }) => ({
    id: organization.id,
    name: organization.name,
    logo: organization.logo,
    slug: organization.slug,
    role,
    memberCount: organization._count.members,
  }));
}

export async function bySlug(ctx: ProtectedContext, input: { slug: string }) {
  const organization = await db.organization.findFirst({
    where: {
      slug: input.slug,
      members: {
        some: {
          userId: ctx.userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      createdAt: true,
      members: {
        where: { userId: ctx.userId },
        select: { id: true, role: true },
      },
    },
  });

  const membership = organization?.members[0];
  if (!organization || !membership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
    createdAt: organization.createdAt,
    role: membership.role,
  };
}
