import { requireSession } from "@/lib/authentication";
import * as organizationService from "@/server/services/organization";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const session = await requireSession("/dashboard");
  const organizations = await organizationService.listForUser({
    session: session,
    userId: session.user.id,
  });

  if (organizations.length === 0) redirect("/onboarding");

  const activeId = session.session.activeOrganizationId;
  const active = organizations.find(
    (organization) => organization.id === activeId,
  );
  redirect(`/${(active ?? organizations[0]).slug}`);
};

export default DashboardPage;
