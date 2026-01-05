import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const taskId = "f06abfdc-7fdb-4fd4-bd3b-dccae3fbea4a";
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { agents: { include: { agent: true } } }
    });
    console.log(JSON.stringify(task, null, 2));

    const project = await prisma.project.findUnique({
        where: { id: "879e8a61-14af-471b-9783-ce444e390163" }
    });
    console.log("Project analysis results:", project.analysisResults);

    await prisma.$disconnect();
}

main();
