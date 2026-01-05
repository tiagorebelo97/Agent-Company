import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const projectId = "879e8a61-14af-471b-9783-ce444e390163"; // Mason project
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
        console.error("Project not found");
        return;
    }

    console.log(`Triggering analysis for ${project.name}...`);

    const task = await prisma.task.create({
        data: {
            title: `Manual Analysis: ${project.name}`,
            description: `Analyzing project at ${project.localPath || project.repoUrl}.`,
            status: 'todo',
            priority: 'high',
            type: 'project_analysis',
            project: { connect: { id: projectId } },
            agents: {
                create: [
                    { agent: { connect: { id: 'pm' } } }
                ]
            },
            createdBy: 'system',
            requirements: JSON.stringify({
                project_id: project.id,
                local_path: project.localPath,
                repo_url: project.repoUrl
            })
        }
    });

    console.log(`Task created: ${task.id}`);
    await prisma.$disconnect();
}

main();
