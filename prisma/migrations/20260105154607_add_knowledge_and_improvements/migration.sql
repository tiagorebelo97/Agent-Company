-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN "metadata" TEXT DEFAULT '{}';

-- CreateTable
CREATE TABLE "AgentKnowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT DEFAULT '{}',
    "skillTags" TEXT NOT NULL DEFAULT '[]',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentKnowledge_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
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
    "linkedTasks" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Meeting" ("completedAt", "createdAt", "createdBy", "description", "id", "projectId", "status", "title", "transcript", "updatedAt") SELECT "completedAt", "createdAt", "createdBy", "description", "id", "projectId", "status", "title", "transcript", "updatedAt" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
