const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const project = await prisma.project.update({
            where: { id: 'a3fa7d11-844c-4a4c-aae0-238343d4f1da' },
            data: { localPath: 'D:\\Projetos\\Agent-Company' }
        });
        console.log('Project updated successfully:', project.name, '->', project.localPath);
    } catch (error) {
        console.error('Error updating project:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
