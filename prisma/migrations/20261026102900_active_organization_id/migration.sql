-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeOrganizationId" TEXT;

-- CreateIndex
CREATE INDEX "member_organization_id_idx" ON "member"("organization_id");
