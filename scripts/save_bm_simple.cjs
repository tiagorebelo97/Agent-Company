// Simple Business Model Canvas Save Script
const http = require('http');

const canvas = {
    "customer_segments": {
        "title": "Segmentos de Clientes",
        "content": [
            "🏢 Empresas de Construção Civil (20-200 colaboradores)",
            "👷 Gestores de Obra e Diretores Técnicos",
            "📊 Orçamentistas e Departamentos de Compras",
            "🏗️ Gabinetes de Arquitetura e Engenharia",
            "💼 Promotores Imobiliários",
            "🔧 Subempreiteiros Especializados"
        ]
    },
    "value_propositions": {
        "title": "Propostas de Valor",
        "content": [
            "🤖 Automatização Inteligente - 80% redução de tempo",
            "🎯 Categorização Automática por Especialidades",
            "📊 Dashboards Visuais - Decisões 3x mais rápidas",
            "👥 Colaboração em Tempo Real",
            "✅ Precisão - 60% redução de erros",
            "🔗 Integração com Excel, AutoCAD, ERPs"
        ]
    },
    "channels": {
        "title": "Canais",
        "content": [
            "🌐 Website + SEO",
            "💼 LinkedIn + Marketing B2B",
            "🤝 Parcerias com Associações",
            "📞 Vendas Direta B2B",
            "🛒 Marketplace de Software",
            "🎁 Programa de Referral"
        ]
    },
    "customer_relationships": {
        "title": "Relações com Clientes",
        "content": [
            "🎓 Onboarding Personalizado (30-60 dias)",
            "🆘 Suporte Multi-Canal (SLA <2h)",
            "👥 Comunidade de Utilizadores",
            "📈 Account Management Proativo",
            "🔬 Co-Criação Beta",
            "🎥 Formação Contínua"
        ]
    },
    "revenue_streams": {
        "title": "Fontes de Receita",
        "content": [
            "💳 SaaS - €29/€79/€149 por user/mês",
            "🏢 Enterprise - €15k-€150k/ano",
            "⚙️ Implementação - €2k-€15k",
            "🛍️ Marketplace - 25-30% comissão",
            "📊 Consultoria - €150/hora",
            "🏷️ White-Label - €5k + €2k/mês"
        ]
    },
    "key_resources": {
        "title": "Recursos-Chave",
        "content": [
            "🧠 Algoritmos de IA",
            "📚 Base de Dados de Especialidades",
            "👨‍💻 Equipa Especializada",
            "☁️ Infraestrutura AWS",
            "🔐 Propriedade Intelectual",
            "🤝 Rede de Parceiros"
        ]
    },
    "key_activities": {
        "title": "Atividades-Chave",
        "content": [
            "💻 Desenvolvimento Ágil",
            "🤖 Treino de IA",
            "📈 Aquisição de Clientes",
            "🎯 Customer Success",
            "🔗 Gestão de Integrações",
            "🔬 Investigação de Mercado"
        ]
    },
    "key_partnerships": {
        "title": "Parcerias-Chave",
        "content": [
            "💼 ERPs - Primavera, PHC, SAP",
            "🏛️ Associações - AICCOPN, OE",
            "🏗️ Distribuidores - Saint-Gobain",
            "🎓 Universidades - IST, FEUP",
            "☁️ Cloud - AWS, Stripe",
            "🤝 Consultoras - Deloitte, PwC"
        ]
    },
    "cost_structure": {
        "title": "Estrutura de Custos",
        "content": [
            "👨‍💻 Desenvolvimento (40% - €240k/ano)",
            "☁️ Infraestrutura (15% - €90k/ano)",
            "📢 Vendas/Marketing (25% - €150k/ano)",
            "🎯 Customer Success (10% - €60k/ano)",
            "🏢 Operações (5% - €30k/ano)",
            "🔬 I&D (5% - €30k/ano)"
        ]
    }
};

const data = JSON.stringify({
    businessModel: JSON.stringify(canvas)
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/projects/879e8a61-14af-471b-9783-ce444e390163/business-model',
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response Body:', body);
        if (res.statusCode === 200) {
            console.log('✅ SUCCESS!');
            console.log('👉 Refresh: http://localhost:5175');
        } else {
            console.log('❌ ERROR - Status:', res.statusCode);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ ERROR:', e.message);
});

req.write(data);
req.end();
