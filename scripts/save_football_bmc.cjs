const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projectId = 'cdacaee7-657e-4fe8-a4d4-fb9748be2866';

    const canvasData = {
        executive_summary: {
            paragraphs: [
                "A Football Ticketing é uma plataforma de ticketing de próxima geração focada em segurança, engajamento de fãs e regulação do mercado secundário através de tecnologia digital avançada.",
                "A nossa solução resolve o problema crônico da falsificação de bilhetes e da especulação descontrolada, devolvendo o controlo aos clubes e garantindo preços justos para os adeptos verdadeiros."
            ]
        },
        key_partnerships: {
            content: [
                "Federações de Futebol e Ligas Nacionais",
                "Operadores de Estádios e Gestores de Recintos",
                "Gateways de Pagamento (Stripe, Adyen)",
                "Clubes de Fãs Organizados e Associações de Adeptos"
            ]
        },
        key_activities: {
            content: [
                "Desenvolvimento de Plataforma Seguro (Blockchain/Encrypted Tiles)",
                "Gestão de Operações de Dia de Jogo e Validação Digital",
                "Análise de Dados de Espectadores e Prevenção de Fraude",
                "Auditoria de Segurança e Compliance com Ligas"
            ]
        },
        key_resources: {
            content: [
                "Infraestrutura Cloud Escalável de Alta Performance",
                "Algoritmos Proprietários de Preço Dinâmico (Anti-Bot)",
                "Parcerias Estratégicas com Ligas e Detentores de Direitos",
                "Equipa de Engenharia Especializada em Ticketing Digital"
            ]
        },
        value_propositions: {
            content: [
                "Bilhetes digitais dinâmicos impossíveis de falsificar",
                "Experiência de compra sem fricção em menos de 10 segundos",
                "Otimização de receita para clubes (Secondary Market Royalties)",
                "Programas de fidelização integrados e Gamificação de Fãs"
            ]
        },
        customer_relationships: {
            content: [
                "Modelo de Suporte Baseado em Performance (SLA 99.9%)",
                "Auto-serviço Automatizado via App",
                "Comunidades Exclusivas de Membros e Acesso Antecipado"
            ]
        },
        channels: {
            content: [
                "Aplicação Móvel Nativa (iOS/Android)",
                "Portais Web Oficiais Integrados com Clubes",
                "Quiosques Digitais e Tablets nos Estádios"
            ]
        },
        customer_segments: {
            content: [
                "Clubes de Futebol Profissional (Ligas Top 5)",
                "Organizadores de Eventos Desportivos de Grande Escala",
                "Adeptos Individuais e Titulares de Lugar Anual",
                "Parceiros Corporativos e VIP Hospitality"
            ]
        },
        cost_structure: {
            content: [
                "Infraestrutura Cloud (AWS/Azure) de Alta Disponibilidade",
                "Equipa de Engenharia de Software e Inovação",
                "Equipas de Onboarding e Suporte 'In-Stadium'",
                "Compliance Legal e Proteção de Dados (GDPR)"
            ],
            cost_breakdown: {
                headers: ["Categoria", "Percentagem", "Valor Anual (estimado)", "Descrição"],
                rows: [
                    ["Infraestrutura & Cloud", "40%", "€120k", "Proteção contra bots e tráfego massivo"],
                    ["Desenvolvimento & R&D", "35%", "€105k", "Novas funcionalidades e Apps"],
                    ["Marketing & Vendas", "15%", "€45k", "Aquisição de novos clubes"],
                    ["Segurança & Compliance", "10%", "€30k", "Auditorias e proteção legal"]
                ]
            }
        },
        revenue_streams: {
            content: [
                "Taxa por Transação no Mercado Primário",
                "Royalties sobre Revendas no Mercado Secundário Controlado",
                "Subscrições Mensais de Data Analytics para Clubes",
                "Serviços Premium de Gamificação e Engagement"
            ],
            pricing_table: {
                headers: ["Plano", "Preço Base", "Taxa/Bilhete", "Features Incluídas"],
                rows: [
                    ["Club Starter", "€499/mês", "2.5% + €0.50", "App Web, Support Básico"],
                    ["Club Pro", "€1.499/mês", "1.5% + €0.30", "App Nativa, Analytics, API"],
                    ["Elite League", "Sob Consulta", "Negociável", "White-label, On-site Support"]
                ]
            }
        },
        metadata: {
            generated_at: new Date().toISOString(),
            generated_by: "StrategyAgent swarm (Gemini Pro)",
            version: "2.1",
            domain: "Deportive Innovation & Ticketing",
            methodology: "Business Model Canvas (High-Fidelity)",
            agents_used: [
                { name: "StrategyAgent", role: "Business architecture and market positioning" },
                { name: "FinancialAgent", role: "Revenue streams and cost structure optimization" }
            ]
        }
    };

    try {
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                businessModel: JSON.stringify(canvasData)
            }
        });
        console.log(`✅ Business Model Canvas saved for project: ${updatedProject.name}`);
    } catch (error) {
        console.error('❌ Error saving BMC:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
