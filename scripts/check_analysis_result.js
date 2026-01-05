import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const taskId = "060c6f18-a0ba-40b8-a6ee-e001340e986b";
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { agents: { include: { agent: true } } }
    });
    console.log("Task Status:", task?.status);
    console.log("Task Result:", task?.result);

    const project = await prisma.project.findUnique({
        where: { id: "879e8a61-14af-471b-9783-ce444e390163" }
    });
    console.log("Project analysisResults length:", project.analysisResults?.length);
    console.log("Project analysisResults:", project.analysisResults);

    await prisma.$disconnect();
}

main();
