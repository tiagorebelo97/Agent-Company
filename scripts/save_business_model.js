const canvas = {
    "metadata": {
        "project": "Mason",
        "domain": "Construction Technology - SaaS",
        "methodology": "Business Model Canvas (Alexander Osterwalder)",
        "version": "2.0",
        "generated_by": "Strategy Agent (Gemini-powered)",
        "generated_at": new Date().toISOString(),
        "patterns_applied": ["Freemium", "Multi-Sided Platform", "SaaS Subscription"]
    },
    "customer_segments": {
        "title": "Segmentos de Clientes",
        "content": [
            "🏢 Empresas de Construção Civil (20-200 colaboradores) - Gestão de múltiplos projetos com controlo rigoroso de custos",
            "👷 Gestores de Obra e Diretores Técnicos - Responsáveis por execução e controlo orçamental em tempo real",
            "📊 Orçamentistas e Departamentos de Compras - Preparação de propostas comerciais competitivas",
            "🏗️ Gabinetes de Arquitetura e Engenharia - Estimativa de custos para projetos de clientes",
            "💼 Promotores Imobiliários - Controlo de investimentos e previsão de rentabilidade",
            "🔧 Subempreiteiros Especializados - Extração rápida de medições específicas"
        ]
    },
    "value_propositions": {
        "title": "Propostas de Valor",
        "content": [
            "🤖 Automatização Inteligente com IA - Redução de 80% do tempo vs. análise manual",
            "🎯 Categorização Automática por Especialidades - Elimina 100% do trabalho repetitivo",
            "📊 Dashboards Visuais e Intuitivos - Decisões 3x mais rápidas",
            "👥 Colaboração em Tempo Real - Múltiplos utilizadores com controlo de versões",
            "✅ Precisão e Redução de Erros - Redução de 60% na margem de erro",
            "🔗 Integração Nativa - Conectores com Excel, AutoCAD, Primavera, PHC, SAP"
        ]
    },
    "channels": {
        "title": "Canais",
        "content": [
            "🌐 Website Corporativo + SEO - Portal otimizado com demos interativas",
            "💼 LinkedIn + Marketing B2B - Campanhas segmentadas e webinars mensais",
            "🤝 Parcerias com Associações - AICCOPN, APPC, Ordem dos Engenheiros",
            "📞 Equipa de Vendas Direta B2B - Demos personalizadas e onboarding",
            "🛒 Marketplace de Software - Presença em Capterra, GetApp",
            "🎁 Programa de Referral - 20% desconto + €500 crédito"
        ]
    },
    "customer_relationships": {
        "title": "Relações com Clientes",
        "content": [
            "🎓 Onboarding Personalizado - Customer Success Manager dedicado (30-60 dias)",
            "🆘 Suporte Técnico Multi-Canal - Chat, email, telefone com SLA <2h",
            "👥 Comunidade de Utilizadores - Fórum com 500+ membros ativos",
            "📈 Account Management Proativo - Revisões trimestrais (QBRs)",
            "🔬 Programa de Co-Criação Beta - Top 10% participa no roadmap",
            "🎥 Formação Contínua - Webinars mensais e certificação Mason Expert"
        ]
    },
    "revenue_streams": {
        "title": "Fontes de Receita",
        "content": [
            "💳 Subscrição SaaS - Freemium + €29/€79/€149 por utilizador/mês",
            "🏢 Contratos Enterprise - €15k-€150k anuais customizados",
            "⚙️ Serviços de Implementação - €2k-€15k one-time fees",
            "🛍️ Marketplace de Add-ons - Comissão 25-30% sobre integrações",
            "📊 Consultoria em Processos - €150/hora ou pacotes",
            "🏷️ Licenciamento White-Label - €5k setup + €2k/mês + 10% revenue share"
        ]
    },
    "key_resources": {
        "title": "Recursos-Chave",
        "content": [
            "🧠 Algoritmos de IA - Modelos treinados com 10.000+ mapas de quantidades",
            "📚 Base de Dados de Especialidades - 50+ categorias de construção",
            "👨‍💻 Equipa Especializada - 8 developers, 2 data scientists, 2 designers",
            "☁️ Infraestrutura AWS - Serverless, 99.9% uptime, ISO 27001",
            "🔐 Propriedade Intelectual - 2 patentes pendentes sobre algoritmos",
            "🤝 Rede de Parceiros - Primavera, AICCOPN, Saint-Gobain, IST"
        ]
    },
    "key_activities": {
        "title": "Atividades-Chave",
        "content": [
            "💻 Desenvolvimento Ágil - Sprints quinzenais com deploy contínuo",
            "🤖 Treino de IA - Refinamento mensal de modelos (92% → 95% accuracy)",
            "📈 Aquisição de Clientes - Marketing + demos (25% conversão)",
            "🎯 Customer Success - Monitorização proativa, 90% retention",
            "🔗 Gestão de Integrações - 15+ conectores ativos mantidos",
            "🔬 Investigação de Mercado - Análise trimestral de tendências"
        ]
    },
    "key_partnerships": {
        "title": "Parcerias-Chave",
        "content": [
            "💼 ERPs de Construção - Primavera, PHC, SAP (5.000+ empresas)",
            "🏛️ Associações Profissionais - AICCOPN, Ordem dos Engenheiros",
            "🏗️ Distribuidores de Materiais - Saint-Gobain, Leroy Merlin (50k produtos)",
            "🎓 Universidades - IST, FEUP para I&D e recrutamento",
            "☁️ Cloud Providers - AWS ($100k créditos), Stripe, Intercom",
            "🤝 Consultoras - Deloitte, PwC para clientes enterprise"
        ]
    },
    "cost_structure": {
        "title": "Estrutura de Custos",
        "content": [
            "👨‍💻 Desenvolvimento (40% - €240k/ano) - Salários + ferramentas",
            "☁️ Infraestrutura (15% - €90k/ano) - AWS escalável (€3/user/mês)",
            "📢 Vendas e Marketing (25% - €150k/ano) - Sales team + campanhas",
            "🎯 Customer Success (10% - €60k/ano) - Suporte + ferramentas",
            "🏢 Operações (5% - €30k/ano) - Contabilidade, legal, escritório",
            "🔬 I&D e Inovação (5% - €30k/ano) - Projetos, conferências, formação"
        ]
    }
};

fetch('http://localhost:3001/api/projects/879e8a61-14af-471b-9783-ce444e390163/business-model', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessModel: JSON.stringify(canvas) })
})
    .then(r => r.json())
    .then(d => {
        console.log('✅ SUCCESS!', d);
        console.log('Refresh the page: http://localhost:5175');
    })
    .catch(e => console.error('❌ ERROR:', e));
