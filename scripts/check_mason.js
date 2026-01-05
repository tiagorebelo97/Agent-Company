import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.findUnique({
        where: { id: "879e8a61-14af-471b-9783-ce444e390163" }
    });

    console.log("Local Path in DB:", project.localPath);
    if (project.localPath) {
        const absolutePath = path.resolve(process.cwd(), project.localPath);
        console.log("Resolved Absolute Path:", absolutePath);
        console.log("Path Exists:", fs.existsSync(absolutePath));
        if (fs.existsSync(absolutePath)) {
            console.log("Is Directory:", fs.statSync(absolutePath).isDirectory());
            console.log("Top level files:", fs.readdirSync(absolutePath));
        }
    }
    console.log("Suggested Agents:", project.suggestedAgents);

    const tasks = await prisma.task.findMany({
        where: { projectId: "879e8a61-14af-471b-9783-ce444e390163" },
        orderBy: { createdAt: 'desc' },
        take: 1
    });
    console.log("Latest Task Result:", tasks[0]?.result);
    console.log("Latest Task Status:", tasks[0]?.status);

    await prisma.$disconnect();
}

main();
