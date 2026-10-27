import "server-only";
import { ProtectedContext } from "@/lib/validations/auth";
import db from "@/lib/db";

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
