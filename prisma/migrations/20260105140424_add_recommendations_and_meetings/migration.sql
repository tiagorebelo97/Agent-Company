-- AlterTable
ALTER TABLE "Project" ADD COLUMN "analysisResults" TEXT DEFAULT '{}';
ALTER TABLE "Project" ADD COLUMN "assignedAgents" TEXT DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "localPath" TEXT;
ALTER TABLE "Project" ADD COLUMN "reports" TEXT DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "suggestedAgents" TEXT DEFAULT '[]';

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "implementedAt" DATETIME,
    "taskId" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT 'pm',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recommendation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "transcript" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeetingParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingParticipant_meetingId_agentId_key" ON "MeetingParticipant"("meetingId", "agentId");
