-- Move from single user.role to many-to-many UserRole.
-- Plot holder status is derived from active plot assignments.

ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TREASURER');

CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

ALTER TABLE "UserRole"
ADD CONSTRAINT "UserRole_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "UserRole" ("id", "userId", "role", "createdAt")
SELECT
  'ur_' || md5("id" || '_' || "role"::text),
  "id",
  "role"::text::"Role",
  CURRENT_TIMESTAMP
FROM "User"
WHERE "role"::text IN ('ADMIN', 'TREASURER');

ALTER TABLE "User" DROP COLUMN "role";

DROP TYPE "Role_old";
