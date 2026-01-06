const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBusinessModel() {
    try {
        const project = await prisma.project.findUnique({
            where: { id: '879e8a61-14af-471b-9783-ce444e390163' }
        });

        console.log('Project:', project.name);
        console.log('businessModel exists:', !!project.businessModel);
        console.log('businessModel length:', project.businessModel ? project.businessModel.length : 0);
        console.log('businessModel value:', project.businessModel ? project.businessModel.substring(0, 100) + '...' : 'NULL');

        if (project.businessModel && project.businessModel !== '{}') {
            const parsed = JSON.parse(project.businessModel);
            console.log('\n✅ Business Model Canvas encontrado!');
            console.log('Blocos:', Object.keys(parsed).length);
            console.log('Primeiro bloco:', Object.keys(parsed)[0]);
        } else {
            console.log('\n❌ Business Model está vazio ou é {}');
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkBusinessModel();
