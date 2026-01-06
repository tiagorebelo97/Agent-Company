const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Find Mason project (not Agent Company)
        const mason = await prisma.project.findFirst({
            where: {
                name: { contains: 'Mason' }
            }
        });

        if (!mason) {
            console.log('Mason project not found.');
            return;
        }

        const canvasData = JSON.parse(mason.businessModel);
        canvasData.executive_summary = {
            paragraphs: [
                "O Mason é uma plataforma SaaS inovadora que revoluciona a gestão de orçamentos na construção civil através de inteligência artificial e automação avançada.",
                "Este documento apresenta o Business Model Canvas completo, detalhando os 9 blocos fundamentais do modelo de negócio e incluindo projeções financeiras detalhadas para os próximos 3 anos."
            ]
        };

        await prisma.project.update({
            where: { id: mason.id },
            data: { businessModel: JSON.stringify(canvasData) }
        });
        console.log('Mason BMC summary updated successfully.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
