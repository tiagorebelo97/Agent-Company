const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Canvas with CORRECT field names matching BusinessModel.jsx expectations
const canvas = {
    "metadata": {
        "project": "Mason",
        "methodology": "Business Model Canvas (Osterwalder)",
        "generated_by": "Strategy Agent + Gemini"
    },
    "key_partners": {
        "title": "Parcerias-Chave",
        "content": [
            "💼 ERPs de Construção - Primavera, PHC, SAP",
            "🏛️ Associações Profissionais - AICCOPN, Ordem dos Engenheiros",
            "🏗️ Distribuidores de Materiais - Saint-Gobain, Leroy Merlin",
            "🎓 Universidades - IST, FEUP para I&D",
            "☁️ Cloud Providers - AWS, Stripe, Intercom",
            "🤝 Consultoras - Deloitte, PwC"
        ]
    },
    "key_activities": {
        "title": "Atividades-Chave",
        "content": [
            "💻 Desenvolvimento Ágil - Sprints quinzenais",
            "🤖 Treino de IA - Refinamento de modelos",
            "📈 Aquisição de Clientes - Marketing + demos",
            "🎯 Customer Success - 90% retention",
            "🔗 Gestão de Integrações - 15+ conectores",
            "🔬 Investigação de Mercado"
        ]
    },
    "key_resources": {
        "title": "Recursos-Chave",
        "content": [
            "🧠 Algoritmos de IA - 10.000+ mapas treinados",
            "📚 Base de Dados - 50+ especialidades",
            "👨‍💻 Equipa Especializada - Developers + Data Scientists",
            "☁️ Infraestrutura AWS - 99.9% uptime",
            "🔐 Propriedade Intelectual - 2 patentes pendentes",
            "🤝 Rede de Parceiros Estratégicos"
        ]
    },
    "value_propositions": {
        "title": "Propostas de Valor",
        "content": [
            "🤖 Automatização Inteligente - 80% redução de tempo",
            "🎯 Categorização Automática por Especialidades",
            "📊 Dashboards Visuais - Decisões 3x mais rápidas",
            "👥 Colaboração em Tempo Real com controlo de versões",
            "✅ Precisão - 60% redução de erros vs. Excel manual",
            "🔗 Integração Nativa - Excel, AutoCAD, Primavera, PHC, SAP"
        ]
    },
    "customer_relationships": {
        "title": "Relações com Clientes",
        "content": [
            "🎓 Onboarding Personalizado - CSM dedicado (30-60 dias)",
            "🆘 Suporte Multi-Canal - Chat, email, telefone (SLA <2h)",
            "👥 Comunidade de Utilizadores - Fórum com 500+ membros",
            "📈 Account Management Proativo - Revisões trimestrais",
            "🔬 Co-Criação Beta - Top 10% participa no roadmap",
            "🎥 Formação Contínua - Webinars e certificação"
        ]
    },
    "channels": {
        "title": "Canais",
        "content": [
            "🌐 Website + SEO - Portal otimizado com demos",
            "💼 LinkedIn + Marketing B2B - Webinars mensais",
            "🤝 Parcerias com Associações - AICCOPN, APPC",
            "📞 Vendas Direta B2B - Demos personalizadas",
            "🛒 Marketplace - Capterra, GetApp",
            "🎁 Programa de Referral - 20% desconto + €500"
        ]
    },
    "customer_segments": {
        "title": "Segmentos de Clientes",
        "content": [
            "🏢 Empresas de Construção Civil (20-200 colaboradores)",
            "👷 Gestores de Obra e Diretores Técnicos",
            "📊 Orçamentistas e Departamentos de Compras",
            "🏗️ Gabinetes de Arquitetura e Engenharia",
            "💼 Promotores Imobiliários",
            "🔧 Subempreiteiros Especializados (AVAC, Elétrica)"
        ]
    },
    "cost_structure": {
        "title": "Estrutura de Custos",
        "content": [
            "👨‍💻 Desenvolvimento (40%) - €240k/ano - Salários + ferramentas",
            "☁️ Infraestrutura (15%) - €90k/ano - AWS escalável",
            "📢 Vendas/Marketing (25%) - €150k/ano - Sales team + campanhas",
            "🎯 Customer Success (10%) - €60k/ano - Suporte técnico",
            "🏢 Operações (5%) - €30k/ano - Contabilidade, legal",
            "🔬 I&D (5%) - €30k/ano - Investigação e inovação"
        ]
    },
    "revenue_streams": {
        "title": "Fontes de Receita",
        "content": [
            "💳 Subscrição SaaS - Freemium + €29/€79/€149 por user/mês",
            "🏢 Contratos Enterprise - €15k-€150k/ano customizados",
            "⚙️ Implementação - €2k-€15k one-time fees",
            "🛍️ Marketplace Add-ons - 25-30% comissão",
            "📊 Consultoria - €150/hora ou pacotes",
            "🏷️ White-Label - €5k setup + €2k/mês + 10% revenue share"
        ]
    }
};

async function saveCorrectBusinessModel() {
    try {
        const project = await prisma.project.update({
            where: { id: '879e8a61-14af-471b-9783-ce444e390163' },
            data: {
                businessModel: JSON.stringify(canvas)
            }
        });

        console.log('✅ Business Model Canvas atualizado com nomes corretos!');
        console.log('Length:', project.businessModel.length);

        // Trigger WebSocket event
        const io = require('socket.io-client');
        const socket = io('http://localhost:3001');

        socket.on('connect', () => {
            console.log('📡 Emitting project:updated event...');
            socket.emit('project:updated', project);
            setTimeout(() => {
                socket.disconnect();
                console.log('\n🎉 DONE! Refresh browser: http://localhost:5175');
                console.log('   Projects → Mason → Business Model');
                process.exit(0);
            }, 1000);
        });

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

saveCorrectBusinessModel();
