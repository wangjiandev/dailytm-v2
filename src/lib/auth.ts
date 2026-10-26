import { ac, roles } from "@/lib/permissions";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, twoFactor } from "better-auth/plugins";
import db from "@/lib/db";
import {
  defaultPlan,
  maxMembersFor,
  ORGANIZATIONS_PRE_USER,
  PLAN_LIMITS,
} from "@/lib/entitlements";
import { DEFAULT_WORKFLOW_STATUSES } from "@/lib/workflow-statues";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const auth = betterAuth({
  appName: "DailyTM", // provide your app name. It'll be used as an issuer.
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    twoFactor({
      issuer: "DailyTM",
    }),
    organization({
      ac,
      roles,
      creatorRole: "owner",
      allowUserToCreateOrganization: (user) => user.emailVerified,
      organizationLimit: ORGANIZATIONS_PRE_USER,
      membershipLimit: (_user, organization) => maxMembersFor(organization.id),
      invitationExpiresIn: SEVEN_DAYS_IN_SECONDS,
      invitationLimit: 100, // 100 invitations per organization
      cancelPendingInvitationsOnReInvite: true, // cancel pending invitations when a new invitation
      sendInvitationEmail: async (invitation) => {
        console.log(`Sending invitation email to ${invitation.email}`);
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization, user }) => {
          const limits = PLAN_LIMITS[defaultPlan()];
          await db.entitlement.create({
            data: {
              organizationId: organization.id,
              plan: defaultPlan(),
              ...limits,
            },
          });

          // TODO: record activity

          const creator = await db.member.findFirst({
            where: {
              organizationId: organization.id,
              userId: user.id,
            },
            select: {
              id: true,
            },
          });

          await db.project.create({
            data: {
              name: "General",
              description:
                "Everything that has not found a home in another project yet.",
              ownerId: creator?.id ?? null,
              organizationId: organization.id,
              workflowStatus: {
                create: DEFAULT_WORKFLOW_STATUSES.map((status) => ({
                  organizationId: organization.id,
                  name: status.name,
                  color: status.color,
                  position: status.position,
                  category: status.category,
                })),
              },
            },
          });
        },
        beforeDeleteOrganization: async ({ organization, user }) => {
          const [member, pendingInvitations, entitlement] = await Promise.all([
            db.member.findMany({
              where: {
                organizationId: organization.id,
              },
              select: { id: true, userId: true, createdAt: true },
            }),
            db.invitation.findMany({
              where: {
                organizationId: organization.id,
                status: "pending",
              },
              select: { id: true, userId: true, createdAt: true },
            }),
            db.entitlement.findMany({
              where: {
                organizationId: organization.id,
              },
              select: { id: true, plan: true },
            }),
          ]);
        },
      },
    }),
  ],
});
