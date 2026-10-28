import { AppHeader } from "@/components/app-shell/app-header";
import { ProjectWorkspace } from "@/components/project/prohect-workspace";
import { ProjectGlyph } from "@/components/project/project-client";
import { CreateTaskDialog } from "@/components/project/task/task-form";
import { Button } from "@/components/ui/button";
import { requireActiveOrganization } from "@/lib/authentication";
import { nextCursor } from "@/lib/task.queries";
import * as projectService from "@/server/services/project.service";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const ProjectDetailsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { orgSlug, projectId } = await params;

  const { organization, ctx } = await requireActiveOrganization(
    orgSlug,
    `/${orgSlug}/projects/${projectId}`,
  );

  const project = await projectService.byId(ctx, { projectId }).catch(() => {});
  if (!project) notFound();

  prefetch(
    trpc.task.list.infiniteQueryOptions({}, { getNextPageParam: nextCursor }),
  );

  return (
    <>
      <AppHeader
        crumbs={[
          { label: organization.name, href: `/${orgSlug}` },
          { label: "Projects", href: `/${orgSlug}/projects` },
          { label: project.name, href: `/${orgSlug}` },
        ]}
        actions={
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/${orgSlug}/projects/${projectId}/settings`}
                aria-label="Project Settings"
              >
                <SettingsIcon className="size-4" aria-hidden />
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3 border-b px-4 py-3 md:px-6">
        <ProjectGlyph color={project.color} icon={project.icon} size="lg" />
        <div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-heading">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground truncate text-xs">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <HydrateClient>
          <ProjectWorkspace projectId={projectId} />
        </HydrateClient>
      </div>
    </>
  );
};

export default ProjectDetailsPage;
