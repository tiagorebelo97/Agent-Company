const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { simpleGit } = require('simple-git');
const fs = require('fs');
const path = require('path');

async function main() {
    const projectName = 'Football Ticketing';
    const targetDir = path.join(process.cwd(), 'projects_cache', 'Football-Ticketing');

    try {
        const project = await prisma.project.findFirst({
            where: { name: projectName }
        });

        if (!project) {
            console.log('Project not found');
            return;
        }

        console.log(`Fixing project: ${project.id}`);

        // 1. Ensure projects_cache exists
        const cacheDir = path.join(process.cwd(), 'projects_cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        // 2. Clone if needed
        if (!fs.existsSync(targetDir)) {
            console.log(`Cloning ${project.repoUrl} to ${targetDir}...`);
            await simpleGit().clone(project.repoUrl, targetDir);
            console.log('Clone success!');
        } else {
            console.log('Directory already exists.');
        }

        // 3. Update DB with absolute path
        await prisma.project.update({
            where: { id: project.id },
            data: {
                localPath: targetDir
            }
        });
        console.log(`Database updated with localPath: ${targetDir}`);

        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
