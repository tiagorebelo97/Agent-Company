const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projects = await prisma.project.findMany();
    projects.forEach(p => {
        try {
            const bm = JSON.parse(p.businessModel || '{}');
            console.log(`Project: ${p.name}`);
            console.log(`- BMC sections: ${Object.keys(bm).join(', ')}`);
            if (bm.executive_summary) {
                console.log(`- Executive Summary type: ${typeof bm.executive_summary}`);
            }
        } catch (e) {
            console.log(`Project: ${p.name} - Invalid JSON`);
        }
    });
    await prisma.$disconnect();
}

main();
