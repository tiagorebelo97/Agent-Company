const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { io } = require('socket.io-client');

const projectId = 'a3fa7d11-844c-4a4c-aae0-238343d4f1da';

const bmcData = {
    metadata: {
        domain: "AI Multi-Agent Orchestration & Enterprise Automation",
        methodology: "Business Model Canvas (SaaS Optimized)",
        generated_by: "Strategy Agent + Gemini 2.0",
        version: "1.0",
        generated_at: new Date().toISOString(),
        agents_used: [
            { agent: "Strategy Agent", contribution: "Market positioning, revenue stream design and SaaS metrics." },
            { agent: "Architect Agent", contribution: "Resource allocation and key activity mapping for multi-agent swarm." },
            { agent: "Design Agent", contribution: "Customer relationship and channel optimization." }
        ]
    },
    executive_summary: {
        paragraphs: [
            "O Agent Company é uma plataforma multi-agente de orquestração de IA que centraliza e automatiza fluxos de trabalho complexos de engenharia e negócios através de um enxame de agentes autónomos.",
            "Este documento apresenta o Business Model Canvas completo para o ecossistema Agent Company, detalhando a estratégia de monetização SaaS e os planos de escala para liderar o mercado de Agentic Workflows."
        ]
    },
    customer_segments: {
        content: [
            "Startups de Tecnologia (SaaS) que precisam de auditoria técnica contínua.",
            "Agências Digitais que pretendem escalar a produção com agentes autónomos.",
            "Equipas de Enterprise Architecture que necessitam de governança em IA.",
            "Software Houses focadas em modernização de legacy code."
        ]
    },
    value_propositions: {
        content: [
            "Enxame de Agentes Especialistas: Auditoria em tempo real (Segurança, UX, Código).",
            "Interface Chat-Centric: Colaboração humana com IA sem fricção.",
            "Automação Estratégica: Geração automática de BMCs, Roadmaps e Planos de Implementação.",
            "Redução de Lead Time: Transformação de ideias em código funcional 5x mais rápido."
        ]
    },
    channels: {
        content: [
            "Plataforma Web Mason (Dashboard Principal).",
            "Ecossistema de Integrações (GitHub, Slack, Jira).",
            "Marketplace de Agentes Especializados.",
            "Vendas Diretas Enterprise (Inside Sales)."
        ]
    },
    customer_relationships: {
        content: [
            "Self-Service Onboarding para Startups.",
            "Suporte Dedicado (Agent-as-a-Service) para Enterprise.",
            "Comunidade de Desenvolvedores de Agentes (MCP ecosystem).",
            "Co-criação de fluxos de trabalho personalizados."
        ]
    },
    revenue_streams: {
        content: [
            "Assinaturas Mensais/Anuais (Tiered Pricing).",
            "Taxa de Utilização por Chamada de Agente (API Compute).",
            "Marketplace Commissions (venda de plugins/agentes de terceiros).",
            "Enterprise Support & Customization Fees."
        ],
        pricing_table: {
            headers: ['Plano', 'Preço/Mês', 'Agentes Ativos', 'Agent Calls/mês', 'Features Principais'],
            rows: [
                ['BASIC', '€49', '3', '1,000', 'Dashboards, Git integration'],
                ['PRO', '€199', '10', '10,000', 'Multi-agent orchestration, Custom MCP'],
                ['ELITE', '€499', 'Ilimitados', '50,000', 'Prioridade LLM, Support 24/7'],
                ['ENTERPRISE', 'Custom', 'Ilimitados', 'Ilimitados', 'On-premise deployment, Dedicated LLM']
            ]
        }
    },
    key_resources: {
        content: [
            "Modelos LLM de última geração (Gemini 2.0, Claude 3.5, GPT-4).",
            "Infraestrutura de Orquestração (Node.js/Redis/Prisma stack).",
            "Base de Conhecimento de Agentes Especialistas.",
            "Propriedade Intelectual do Workflow Colaborativo."
        ]
    },
    key_activities: {
        content: [
            "Desenvolvimento e Refinamento de Brain/Agents.",
            "Gestão de Contexto e Memória de Longo Prazo dos Agentes.",
            "Curadoria do Agent Registry e Marketplace.",
            "Otimização de Custos de Inferência LLM."
        ]
    },
    key_partnerships: {
        content: [
            "Google Cloud / DeepMind (Infraestrutura Gemini).",
            "GitHub (Integração de Controlo de Versão).",
            "Empresas de Segurança Cibernética (Feed de vulnerabilidades).",
            "Consultoras de Transformação Digital (Parceiros de Implementation)."
        ]
    },
    cost_structure: {
        content: [
            "Custos de API de LLMs (Google, Anthropic, OpenAI).",
            "Hospedagem e Infraestrutura Cloud (Escalabilidade de CPU/RAM).",
            "Salários de Engenheiros de Software e Especialistas em IA.",
            "Aquisição de Clientes (Marketing Digital e B2B Sales)."
        ],
        cost_breakdown: {
            headers: ['Categoria', 'Percentagem', 'Valor Anual (estimado)', 'Foco de Investimento'],
            rows: [
                ['API Computação', '45%', '€270k', 'Tokens Gemini Pro/Claude 3.5'],
                ['Engenharia de IA', '30%', '€180k', 'Scripts de orquestração e registry'],
                ['Cloud Infra', '10%', '€60k', 'Redis Cluster e instâncias GPU'],
                ['Marketing Digital', '10%', '€60k', 'Ads em Tech Channels e Eventos'],
                ['Operações/Legal', '5%', '€30k', 'Privacidade de dados e compliance']
            ]
        }
    },
    financial_projections: {
        methodology: "SaaS Rule of 40 (Growth + Margin)",
        assumptions: {
            market_size: {
                tam: "€25.4B (Global AI Orchestration Market 2026)",
                sam: "€2.1B (Automated Software Development in Europe)",
                som: "€150M (Agile AI Managed Services for Startups)"
            }
        },
        monthly_projections_year1: [
            { month: "Jan", mrr: 2000, customers: 5, arr: 24000 },
            { month: "Mar", mrr: 8000, customers: 18, arr: 96000 },
            { month: "Jun", mrr: 25000, customers: 45, arr: 300000 },
            { month: "Sep", mrr: 60000, customers: 90, arr: 720000 },
            { month: "Dec", mrr: 120000, customers: 150, arr: 1440000 }
        ],
        annual_projections: [
            {
                year: 1,
                total_revenue: 850000,
                customers: { starter: 100, pro: 40, enterprise: 10 },
                metrics: {
                    mrr_end: 120000,
                    arr: 1440000,
                    cac: 500,
                    ltv: 2500,
                    ltv_cac_ratio: 5,
                    gross_margin: "82%",
                    burn_rate: 60000
                }
            },
            {
                year: 2,
                total_revenue: 3200000,
                customers: { starter: 350, pro: 180, enterprise: 45 },
                metrics: {
                    mrr_end: 350000,
                    arr: 4200000,
                    cac: 420,
                    ltv: 3000,
                    ltv_cac_ratio: 7.1,
                    gross_margin: "85%",
                    burn_rate: 20000
                }
            },
            {
                year: 3,
                total_revenue: 8500000,
                customers: { starter: 800, pro: 500, enterprise: 120 },
                metrics: {
                    mrr_end: 800000,
                    arr: 9600000,
                    cac: 380,
                    ltv: 3500,
                    ltv_cac_ratio: 9.2,
                    gross_margin: "88%",
                    burn_rate: 0
                }
            }
        ],
        scenarios: {
            conservative: {
                description: "Crescimento linear, sem Agent Marketplace.",
                year3_revenue: 5000000,
                year3_customers: 600,
                assumptions: "Churn 3%, CAC estável."
            },
            base: {
                description: "Sucesso no enxame de agentes e adoção B2B sólida.",
                year3_revenue: 8500000,
                year3_customers: 1420,
                assumptions: "Churn 1.5%, Marketplace live em Year 2."
            },
            optimistic: {
                description: "Expansão global e liderança em Agentic Workflows.",
                year3_revenue: 15000000,
                year3_customers: 2500,
                assumptions: "Adoção viral de agências, Churn <1%."
            }
        },
        key_metrics_targets: {
            mrr_growth: "20% MoM em Year 1",
            ltv_cac: "> 5 (High Efficiency)",
            rule_of_40: "Conquistar em Year 2",
            agent_monetization: "€0.05/agent call avg revenue",
            customer_retention: "> 90% Y-o-Y"
        }
    }
};

async function main() {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { businessModel: JSON.stringify(bmcData) }
        });
        console.log('Agent Company BMC updated successfully.');

        // Trigger update via WS
        const socket = io('http://localhost:3001');
        socket.on('connect', () => {
            socket.emit('project:updated', { projectId });
            console.log('WebSocket event emitted.');
            setTimeout(() => {
                socket.disconnect();
                process.exit(0);
            }, 1000);
        });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
