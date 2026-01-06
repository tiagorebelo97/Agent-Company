const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const projects = await prisma.project.findMany();
        console.log(JSON.stringify(projects, null, 2));
    } catch (error) {
        console.error('Error fetching projects:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
