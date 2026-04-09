CREATE TABLE "UserChangeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "plotId" TEXT,

    CONSTRAINT "UserChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlotChangeLog" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "userId" TEXT,

    CONSTRAINT "PlotChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserChangeLog_userId_createdAt_idx" ON "UserChangeLog"("userId", "createdAt");
CREATE INDEX "UserChangeLog_plotId_createdAt_idx" ON "UserChangeLog"("plotId", "createdAt");
CREATE INDEX "PlotChangeLog_plotId_createdAt_idx" ON "PlotChangeLog"("plotId", "createdAt");
CREATE INDEX "PlotChangeLog_userId_createdAt_idx" ON "PlotChangeLog"("userId", "createdAt");

ALTER TABLE "UserChangeLog"
ADD CONSTRAINT "UserChangeLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserChangeLog"
ADD CONSTRAINT "UserChangeLog_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserChangeLog"
ADD CONSTRAINT "UserChangeLog_plotId_fkey"
FOREIGN KEY ("plotId") REFERENCES "Plot"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlotChangeLog"
ADD CONSTRAINT "PlotChangeLog_plotId_fkey"
FOREIGN KEY ("plotId") REFERENCES "Plot"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlotChangeLog"
ADD CONSTRAINT "PlotChangeLog_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlotChangeLog"
ADD CONSTRAINT "PlotChangeLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
