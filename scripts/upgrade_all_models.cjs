const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const io = require('socket.io-client');

// =========================================================================
// 1. MASON - INDUSTRIAL EFFICIENCY (HYBRID MODEL)
// =========================================================================
const masonCanvas = {
    "metadata": {
        "project": "Mason",
        "domain": "Construction Technology",
        "economic_engine": "Industrial Efficiency & Compliance",
        "version": "6.0 - Pure Industry DNA"
    },
    "executive_summary": {
        "paragraphs": [
            "O Mason resolve o caos informacional da construção civil. Atuamos como a camada de dados que orquestra Mapas de Quantidades (BoQ) entre o projeto e a obra.",
            "Diferente de um SaaS genérico, o nosso valor está na precisão da medição e na conformidade legal, reduzindo derrapagens financeiras que assolam 90% das obras de engenharia civil."
        ]
    },
    "customer_segments": {
        "title": "Segmentos Industriais",
        "content": [
            "🏗️ Grandes Construtoras (Tier 1) - Foco em gestão de riscos e compras centralizadas.",
            "🏛️ Gabinetes de Engenharia Civil - Criadores de BoQs que precisam de automação de parsing.",
            "🌍 Donos de Obra Públicos - Municípios que exigem transparência e rastreabilidade total de custos.",
            "📋 Quantity Surveyors Independentes - Profissionais que procuram ferramentas de produtividade extrema."
        ]
    },
    "value_propositions": {
        "content": [
            "🤖 AI-BoQ Extraction: Parsing instantâneo de orçamentos complexos com detecção de erros.",
            "⚖️ Legal Compliance: Verificação automática de normas de medição europeias.",
            "📉 Cost Variance Control: Sincronização em tempo real entre o projetado e o faturado.",
            "📊 Industrial Benchmarking: Acesso a tabelas de preços de mercado anonimizadas por região."
        ]
    },
    "revenue_streams": {
        "title": "Modelo de Governação Financeira",
        "content": [
            "🏢 Licenciamento Enterprise: €250-€1,500/mês para acesso à plataforma.",
            "🏗️ Taxa de Volume (GAV): 0.03% do valor orçamentado em projetos acima de €500k.",
            "🧩 Módulos de Especialidade: Add-ons para Estabilização, Estruturas ou Acabamentos.",
            "🚀 Setup & Digitalização Legacy: Taxas únicas para migrar históricos de obras anteriores."
        ]
    },
    "financial_projections": {
        "title": "Projeções de Impacto Industrial",
        "methodology": "Modelagem baseada em Pipeline de Obras e Ticket de Licenciamento por Gabinete.",
        "assumptions": {
            "market_size": {
                "tam": "€42.5B (Con-Tech Global)",
                "sam": "€3.8B (European Estimating Tools)",
                "som": "€65M (Península Ibérica, Year 3)"
            },
            "kpis": ["Volume de Obra Gerido (PVUM)", "Margem de Erro Detetada"]
        },
        "monthly_projections_year1": [
            { "month": "T1", "mrr": 4500, "customers": 3, "arr": 54000 },
            { "month": "T2", "mrr": 15000, "customers": 12, "arr": 180000 },
            { "month": "T3", "mrr": 38000, "customers": 28, "arr": 456000 },
            { "month": "T4", "mrr": 72000, "customers": 55, "arr": 864000 }
        ],
        "annual_projections": [
            {
                "year": 1, "total_revenue": 620000,
                "metrics": { "efficiency_gain_to_client": "18%", "avg_order_value": 7500, "gross_margin": "72%" }
            },
            {
                "year": 2, "total_revenue": 2400000,
                "metrics": { "efficiency_gain_to_client": "22%", "avg_order_value": 10200, "gross_margin": "78%" }
            },
            {
                "year": 3, "total_revenue": 6800000,
                "metrics": { "efficiency_gain_to_client": "25%", "avg_order_value": 11500, "gross_margin": "83%" }
            },
            {
                "year": 4, "total_revenue": 14500000,
                "metrics": { "efficiency_gain_to_client": "28%", "avg_order_value": 13000, "gross_margin": "85%" }
            },
            {
                "year": 5, "total_revenue": 32000000,
                "metrics": { "efficiency_gain_to_client": "30%", "avg_order_value": 15000, "gross_margin": "87%" }
            }
        ],
        "scenarios": {
            "conservative": { "description": "Focagem exclusiva em gabinetes de engenharia locais.", "year3_revenue": 3500000, "year3_customers": 250, "assumptions": "Venda B2B lenta" },
            "base": { "description": "Liderança Con-Tech no Sul da Europa.", "year3_revenue": 6800000, "year3_customers": 580, "assumptions": "5% share em concursos públicos" }
        }
    },
    "cost_structure": {
        "content": [
            "IA & Engineering (45%): Motor de extração e segurança de dados.",
            "Legal & Compliance (15%): Certificação de normas de medição.",
            "Regional Sales Force (30%): Presença em estaleiros e gabinetes.",
            "Cloud Hosting (10%): Storage de arquivos técnicos pesados."
        ]
    },
    "key_resources": { "content": ["Engine Propriatária (BoQ-LLM)", "Dataset Histórico de Preços", "Parcerias com Ordem dos Engenheiros"] },
    "key_activities": { "content": ["Refinamento de OCR Técnico", "Venda Governamental", "Manutenção de Tabelas de Preços"] },
    "key_partnerships": { "content": ["Gabinetes de Projecto", "Empresas de Fiscalização", "Bancos (Project Finance)"] },
    "customer_relationships": { "content": ["Suporte Técnico de Engenharia", "Consultoria de Onboarding", "Comunidade Mason Certificada"] },
    "channels": { "content": ["Feiras de Construção", "Venda Directa B2B", "Marketplace de ERPs"] }
};

// =========================================================================
// 2. FOOTBALL TICKETING - TRANSACTIONAL INFRASTRUCTURE (NOT SaaS)
// =========================================================================
const footballCanvas = {
    "metadata": {
        "project": "Football Ticketing",
        "domain": "Sports Entertainment",
        "economic_engine": "Transactional Commission Layer",
        "version": "6.0 - Pure Industry DNA"
    },
    "executive_summary": {
        "paragraphs": [
            "A Football Ticketing é a ponte entre o estádio e o adepto. Não somos apenas um software, somos a infraestrutura que garante a integridade de cada entrada em recintos desportivos.",
            "Não cobramos subscrições fixas chorudas; ganhamos quando o clube ganha. O nosso sucesso está ligado à assistência nos jogos e na erradicação do mercado negro através de um marketplace oficial controlado."
        ]
    },
    "customer_segments": {
        "content": [
            "🏟️ Clubes de Elite (Champions League) - Necessidade de segurança extrema e VIP management.",
            "🎟️ Adeptos Comuns - Compradores ocasionais que exigem zero fraude.",
            "🤝 Parceiros de Hospitalidade - Agências que gerem camarotes e corporate seats.",
            "🚓 Autoridades de Segurança - Precisam de previsões reais de entrada e perfis de risco."
        ]
    },
    "value_propositions": {
        "content": [
            "🛡️ Fraud-Proof Ticketing: Dynamic QR codes imunes a capturas de ecrã.",
            "♻️ Secondary Market Royalties: O clube captura 12% em cada revenda entre adeptos.",
            "⚡ Peak Stability: Suporte para abertura de vendas de 50k bilhetes em 30 minutos.",
            "📱 Unified Fan Wallet: Pagamento contactless in-stadium via bilhete."
        ]
    },
    "revenue_streams": {
        "title": "Motor de Receita Transacional",
        "content": [
            "🎫 Comissões Primárias (Fees): €1.20 - €2.50 por bilhete emitido.",
            "🔄 Royalties de Revenda: 12% do Delta de valor na revenda oficial.",
            "🛠️ Integração de Torniquetes: €25k por estádio (Setup Fee).",
            "📢 Spot Advertising in-App: Monetização do ecrã de acesso no dia do jogo."
        ]
    },
    "financial_projections": {
        "title": "Projeções de Volume de Transações",
        "methodology": "Modelagem baseada em Match-Day Attendance e TTV (Total Ticket Value).",
        "assumptions": {
            "market_size": {
                "tam": "€12.5B (Global Ticket Market)",
                "sam": "€950M (European Sport Tech)",
                "som": "€45M (Mercado Ibérico, Year 3)"
            },
            "kpis": ["Take Rate Médio", "Taxa de Revenda Controlada"]
        },
        "monthly_projections_year1": [
            { "month": "Ago", "mrr": 12000, "customers": "1 Clube Elite", "arr": 144000 },
            { "month": "Nov", "mrr": 45000, "customers": "3 Clubes", "arr": 540000 },
            { "month": "Fev", "mrr": 68000, "customers": "5 Clubes", "arr": 816000 },
            { "month": "Mai", "mrr": 115000, "customers": "8 Clubes", "arr": 1380000 }
        ],
        "annual_projections": [
            {
                "year": 1, "total_revenue": 1150000,
                "metrics": { "tickets_sold": "1.8M", "revenue_per_fan": "€0.64", "gross_margin": "55%" }
            },
            {
                "year": 2, "total_revenue": 4200000,
                "metrics": { "tickets_sold": "6.2M", "revenue_per_fan": "€0.68", "gross_margin": "62%" }
            },
            {
                "year": 3, "total_revenue": 10500000,
                "metrics": { "tickets_sold": "14.5M", "revenue_per_fan": "€0.72", "gross_margin": "68%" }
            }
        ],
        "scenarios": {
            "base": { "description": "Consolidação na 1ª e 2ª Liga PT/ES.", "year3_revenue": 10500000, "year3_customers": "25 Estádios", "assumptions": "Controlo de 30% do mercado ibérico" },
            "optimistic": { "description": "Contrato exclusivo com Federação Nacional.", "year3_revenue": 25000000, "year3_customers": "80 Estádios", "assumptions": "Jogos da Seleção incluídos" }
        }
    },
    "cost_structure": {
        "content": [
            "Hardware & Access Control (35%): Manutenção de torniquetes e sensores.",
            "Cyber-Security & Anti-Bot (25%): Defesa contra scripts de mercado negro.",
            "Elastic Hosting (20%): Picos de tráfego em dia de jogo/lançamento.",
            "Marketing & Partnership (20%): Lobbies desportivos e federações."
        ]
    },
    "key_resources": { "content": ["Dynamic QR Patent", "On-Site Support Teams", "High-Throughput Payment Gateways"] },
    "key_activities": { "content": ["Gestão de Filas Virtuais", "Upgrade de Torniquetes", "Auditoria de Revenda"] },
    "key_partnerships": { "content": ["Ligas Profissionais", "Federações", "Marcas Desportivas"] },
    "customer_relationships": { "content": ["Account Manager por Estádio", "Helpdesk Adepto Match-Day", "Dashboards de Operações"] },
    "channels": { "content": ["App Mobile", "Terminais de Bilheteira", "Sites Oficiais de Clubes"] }
};

// =========================================================================
// 3. AGENT COMPANY - TOKEN ECONOMY (AI USAGE MODEL)
// =========================================================================
const agentCompanyCanvas = {
    "metadata": {
        "project": "Agent Company",
        "domain": "AI Infrastructure",
        "economic_engine": "Usage-Based Token Economy",
        "version": "6.0 - Pure Industry DNA"
    },
    "executive_summary": {
        "paragraphs": [
            "O Agent Company é a utilidade elétrica da era da IA. Somos a camada de orquestração que permite a empresas executarem enxames de agentes sem se preocuparem com a infraestrutura.",
            "O nosso modelo é 100% elástico: se o cliente não consome inteligência, não paga. Escalamos com a complexidade das tarefas que os agentes resolvem."
        ]
    },
    "customer_segments": {
        "content": [
            "🤖 AI Native Startups - Empresas que constroem em cima de nós.",
            "🏢 IT Enterprise departments - Focados em governança e segurança de agentes.",
            "🔍 Agências de Automação - Usam-nos como backend para os seus clientes.",
            "💻 Developers Independentes - Long tail de criadores de enxames."
        ]
    },
    "value_propositions": {
        "content": [
            "🧠 Universal Orchestrator: Gestão de estados e delegados entre LLMs (Gemini, Claude, GPT).",
            "🔐 Vault Security: Anonimização automática de dados sensíveis antes de chegar ao LLM.",
            "💸 Model Arbitrage: Escolha dinâmica do modelo mais barato para cada etapa da tarefa.",
            "🔌 MCP Integration: Ligação nativa a ficheiros, bases de dados e APIS locais."
        ]
    },
    "revenue_streams": {
        "title": "Fluxos de Valor Computacional",
        "content": [
            "🔌 Token Throughput (Usage): €0.05 por cada 1M de tokens processados.",
            "🏢 Enterprise Vault License: €499/mês para instâncias on-premise isoladas.",
            "🛍️ Marketplace Take: 25% de comissão sobre venda de agentes terceiros.",
            "📊 AI Strategy Consulting: Serviços por hora para desenhar Swarms complexos."
        ]
    },
    "financial_projections": {
        "title": "Projeções de Consumo Computacional",
        "methodology": "Modelagem baseada em Token Burn-Rate e Active Agent Swarms.",
        "assumptions": {
            "market_size": {
                "tam": "€85B (AI Operations 2027)",
                "sam": "€6.5B (Agentic Workflow Management)",
                "som": "€55M (Early Adopters in EU, Year 3)"
            },
            "kpis": ["Tokens processed per org", "Active Swarms retention"]
        },
        "monthly_projections_year1": [
            { "month": "Jan", "mrr": 2000, "customers": 5, "arr": 24000 },
            { "month": "Abr", "mrr": 15000, "customers": 45, "arr": 180000 },
            { "month": "Ago", "mrr": 55000, "customers": 150, "arr": 660000 },
            { "month": "Dez", "mrr": 185000, "customers": 480, "arr": 2220000 }
        ],
        "annual_projections": [
            {
                "year": 1, "total_revenue": 1450000,
                "metrics": { "tokens_processed": "45B", "active_agents": "12k", "gross_margin": "88%" }
            },
            {
                "year": 2, "total_revenue": 8500000,
                "metrics": { "tokens_processed": "380B", "active_agents": "95k", "gross_margin": "92%" }
            },
            {
                "year": 3, "total_revenue": 34000000,
                "metrics": { "tokens_processed": "2.2T", "active_agents": "450k", "gross_margin": "95%" }
            }
        ],
        "scenarios": {
            "base": { "description": "Liderança no segmento de 'Agentic Orchestration' Europeu.", "year3_revenue": 34000000, "year3_customers": 4200, "assumptions": "Uso massivo de modelos médios (Gemini Flash)" }
        }
    },
    "cost_structure": {
        "content": [
            "LLM API Fees (50%): Custos variáveis directos aos provedores (Google/OpenAI).",
            "Infrastructure Engineering (30%): Optimização de latência e segurança.",
            "Developer Evangelism (15%): Documentação e SDK growth.",
            "GPU Reservation (5%): Instâncias on-demand para picos de processamento."
        ]
    },
    "key_resources": { "content": ["Orchestrator Core", "Agent SDK", "Datavault IP"] },
    "key_activities": { "content": ["Latência Reduction", "Marketplace Curation", "Protocol Standards (MCP)"] },
    "key_partnerships": { "content": ["Google Cloud", "Anthropic", "GitHub"] },
    "customer_relationships": { "content": ["API-First Support", "Discord Community", "Co-Design Sessions"] },
    "channels": { "content": ["GitHub Marketplace", "Product Hunt", "LinkedIn Ads"] }
};

async function upgradeAllModels() {
    try {
        console.log('🚀 FINAL UPGRADE: Applying Radical Project DNA (NO GENERIC TEMPLATES)...');

        // 1. Upgrade MASON
        const masonProject = await prisma.project.findFirst({ where: { name: 'Mason' } });
        if (masonProject) {
            await prisma.project.update({
                where: { id: masonProject.id },
                data: { businessModel: JSON.stringify(masonCanvas) }
            });
            console.log(`✅ ${masonProject.name}: Applied Industrial Efficiency Model (5-Year)`);
        }

        // 2. Upgrade FOOTBALL
        const footballProject = await prisma.project.findFirst({ where: { name: 'Football Ticketing' } });
        if (footballProject) {
            await prisma.project.update({
                where: { id: footballProject.id },
                data: { businessModel: JSON.stringify(footballCanvas) }
            });
            console.log(`✅ ${footballProject.name}: Applied Transactional Infrastructure Model`);
        }

        // 3. Upgrade AGENT COMPANY
        const agentCoProject = await prisma.project.findFirst({ where: { name: 'Agent Company' } });
        if (agentCoProject) {
            await prisma.project.update({
                where: { id: agentCoProject.id },
                data: { businessModel: JSON.stringify(agentCompanyCanvas) }
            });
            console.log(`✅ ${agentCoProject.name}: Applied Token Economy / Usage Model`);
        }

        console.log('\n📊 RADICAL DNA UPGRADE COMPLETE.');
        const socket = io('http://localhost:3001');
        socket.on('connect', () => {
            console.log('📡 Emitting update events...');
            if (masonProject) socket.emit('project:updated', { id: masonProject.id });
            if (footballProject) socket.emit('project:updated', { id: footballProject.id });
            if (agentCoProject) socket.emit('project:updated', { id: agentCoProject.id });
            setTimeout(() => {
                socket.disconnect();
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

upgradeAllModels();
