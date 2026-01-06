const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
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

        // Add pricing table
        canvasData.revenue_streams.pricing_table = {
            headers: ['Plano', 'Preço/Mês', 'Utilizadores', 'Projetos', 'Features Principais'],
            rows: [
                ['FREE', '€0', '1', '3', 'Features básicas, 5GB storage'],
                ['STARTER', '€29', 'Ilimitado', '10', 'Categorização automática, 50GB'],
                ['PRO', '€79', 'Ilimitado', 'Ilimitados', 'IA avançada, API, 500GB'],
                ['ENTERPRISE', '€149', 'Ilimitados', 'Ilimitados', 'SSO, SLA 99.9%, suporte 24/7']
            ]
        };

        // Add cost breakdown
        canvasData.cost_structure.cost_breakdown = {
            headers: ['Categoria', 'Percentagem', 'Valor Anual (estimado)', 'Descrição'],
            rows: [
                ['Desenvolvimento', '40%', '€240k', 'Salários equipa técnica + ferramentas'],
                ['Vendas & Marketing', '25%', '€150k', 'Equipa comercial + publicidade'],
                ['Infraestrutura', '15%', '€90k', 'AWS + ferramentas cloud'],
                ['Customer Success', '10%', '€60k', 'Suporte + onboarding'],
                ['Operações/Legal', '5%', '€30k', 'Contabilidade + legal + escritório'],
                ['I&D', '5%', '€30k', 'Investigação + inovação']
            ]
        };

        await prisma.project.update({
            where: { id: mason.id },
            data: { businessModel: JSON.stringify(canvasData) }
        });
        console.log('Mason BMC pricing and costs updated successfully.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
