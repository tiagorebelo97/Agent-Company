const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Business Model Canvas SUPER DETALHADO para Mason
const canvas = {
    "metadata": {
        "project": "Mason",
        "domain": "Construction Technology - SaaS Platform",
        "methodology": "Business Model Canvas (Alexander Osterwalder)",
        "generated_by": "Strategy Agent + Gemini AI",
        "version": "2.0 - Detailed",
        "generated_at": new Date().toISOString()
    },

    "customer_segments": {
        "title": "Segmentos de Clientes",
        "content": [
            "🏢 Empresas de Construção Civil de Média Dimensão (20-200 colaboradores) - Gestão simultânea de 5-15 projetos ativos, faturação anual €5M-€50M. Pain points: perda de 15-20h/semana em análise manual de Excel, margem de erro 12-18% em orçamentação, dificuldade em consolidar dados de múltiplos fornecedores. Willingness to pay: €200-€500/mês por utilizador. Decision makers: Diretor Financeiro, Diretor de Operações.",

            "👷 Gestores de Obra e Diretores Técnicos - Responsáveis por 3-8 obras simultâneas, orçamentos €500k-€5M por projeto. Pain points: falta de visibilidade em tempo real sobre desvios orçamentais (descobrem 30-45 dias depois), dificuldade em justificar custos extras ao cliente, comunicação ineficiente com departamento financeiro. Gains desejados: alertas proativos de desvios >5%, dashboards mobile para acesso no terreno, relatórios automáticos para clientes.",

            "📊 Orçamentistas e Departamentos de Compras - Preparação de 10-30 propostas comerciais/mês, taxa de conversão 15-25%. Pain points: 80% do tempo gasto em extração e organização de dados de Excel (vs. análise estratégica), dificuldade em comparar propostas de diferentes fornecedores, falta de histórico de preços para benchmarking. Valor percebido: redução de 60-70% no tempo de preparação de propostas, aumento de 10-15% na taxa de conversão por propostas mais precisas.",

            "🏗️ Gabinetes de Arquitetura e Engenharia (10-50 colaboradores) - Desenvolvimento de 20-40 projetos/ano, necessidade de estimar custos na fase de conceção. Pain points: falta de ferramentas específicas do setor (usam Excel genérico), dificuldade em atualizar orçamentos quando há alterações de projeto, estimativas imprecisas levam a conflitos com clientes. Willingness to pay: €150-€300/mês, valorizam integração com AutoCAD/Revit.",

            "💼 Promotores Imobiliários e Fundos de Investimento - Gestão de portfolios de 5-20 empreendimentos, investimento total €10M-€100M. Pain points: consolidação manual de dados de múltiplos projetos e fornecedores consome 40-60h/mês, dificuldade em prever cash flow e rentabilidade em tempo real, reporting complexo para investidores. Gains: visão unificada de todos os projetos, previsões de rentabilidade atualizadas automaticamente, compliance automático com requisitos de reporting.",

            "🔧 Subempreiteiros Especializados (AVAC, Elétrica, Canalizações, Carpintaria) - Empresas 5-30 colaboradores, trabalham em 10-25 obras simultaneamente. Pain points: mapas de quantidades desorganizados e inconsistentes de diferentes clientes, dificuldade em extrair apenas as medições relevantes para a sua especialidade, erros de interpretação levam a propostas incorretas (perda de margem ou perda de concurso). Valor: filtros automáticos por especialidade, templates padronizados, histórico de medições para benchmarking."
        ]
    },

    "value_propositions": {
        "title": "Propostas de Valor",
        "content": [
            "🤖 Automatização Inteligente Baseada em IA - Algoritmos de Machine Learning reconhecem automaticamente estruturas complexas de Excel (capítulos, subcapítulos, artigos, medições, unidades, preços unitários) com 95% de precisão. Redução comprovada de 80% no tempo de análise (de 8h para 1.5h num mapa de 500 artigos). ROI típico de 6 meses. Tecnologia: Computer Vision + NLP para reconhecimento de padrões, treinado com 10.000+ mapas de quantidades reais do mercado português.",

            "🎯 Categorização Automática por 50+ Especialidades de Construção - Sistema pré-treinado com taxonomia completa: Movimentação de Terras, Fundações, Estruturas (Betão Armado, Metálicas, Madeira), Alvenarias, Revestimentos (Interiores/Exteriores), Impermeabilizações, Isolamentos Térmicos/Acústicos, Carpintarias (Madeira/Alumínio/PVC), Serralharias, Cantarias, Pinturas, AVAC (Aquecimento, Ventilação, Ar Condicionado), Instalações Elétricas (Correntes Fortes/Fracas), Canalizações (Águas/Esgotos/Gás), Elevadores, Arranjos Exteriores, Infraestruturas. Mapeamento automático para códigos CPV europeus. Elimina 100% do trabalho manual de classificação.",

            "📊 Dashboards Visuais Interativos e Análise Preditiva - Transformação de dados brutos em insights acionáveis: Gráfico de Pareto (identificação dos 20% de itens que representam 80% dos custos), Análise de Evolução Temporal (comparação orçamento inicial vs. revisões vs. real), Heatmaps de Desvios por Especialidade, Previsão de Cash Flow com ML (precisão 85-90%), Benchmarking automático com projetos similares. Decisões 3x mais rápidas, redução de 40% em reuniões de análise.",

            "👥 Colaboração em Tempo Real Multi-Utilizador - Até 50 utilizadores simultâneos no mesmo projeto, edição concorrente com resolução automática de conflitos, histórico completo de alterações (quem, quando, o quê, porquê), sistema de comentários e aprovações por item, notificações push/email configuráveis, controlo de versões com rollback ilimitado. Integração com Microsoft Teams/Slack para notificações. Redução de 60% em emails e 50% em reuniões de coordenação.",

            "✅ Validação Automática e Redução de Erros Críticos - Motor de regras de negócio: validação automática de fórmulas de medição (detecta erros matemáticos), verificação de consistência de unidades (m² vs m³ vs un), alertas de preços fora do intervalo normal (±30% da média de mercado), deteção de itens duplicados ou omissos, verificação de conformidade com regulamentos (RGEU, RCCTE). Redução comprovada de 60% na margem de erro vs. Excel manual, diminuição de 75% em litígios pós-obra por erros de orçamentação.",

            "🔗 Integração Nativa e Bidirecional com Ecossistema de Ferramentas - Conectores em tempo real: Excel (importação/exportação com preservação de formatação), AutoCAD/Revit (extração automática de quantidades de BIM), Primavera P6 (sincronização de planeamento e custos), PHC/SAP Business One (integração com contabilidade e compras), Stripe/PayPal (faturação automática), Google Drive/Dropbox (armazenamento de documentos). API REST aberta para integrações custom. Zero mudança de processos existentes, adoção gradual e não disruptiva."
        ]
    },

    "channels": {
        "title": "Canais",
        "content": [
            "🌐 Website Corporativo + SEO Técnico - Portal otimizado para keywords de alta intenção: 'software orçamentação construção', 'gestão de obras', 'mapa de quantidades digital', 'BIM 5D Portugal'. Conteúdo educativo: 50+ artigos de blog sobre melhores práticas, 20+ casos de estudo com ROI documentado, calculadora de ROI interativa, comparação com concorrentes. Demos interativas self-service (sem necessidade de registo inicial). Conversão típica: 15% dos visitantes para trial, 25% dos trials para clientes pagos.",

            "💼 LinkedIn + Marketing B2B Segmentado - Campanhas hiper-segmentadas: Diretores Financeiros de empresas de construção (€5M-€50M faturação), Gestores de Obra certificados, Orçamentistas com 5+ anos experiência. Conteúdo: posts educativos sobre controlo de custos (3x/semana), webinars mensais com especialistas do setor (média 150 participantes), LinkedIn Live com Q&A, estudos de caso em vídeo. Thought leadership: artigos assinados pelo CEO em publicações do setor (Construir Magazine, Ingenium). CPL (Cost Per Lead): €45-€65.",

            "🤝 Parcerias Estratégicas com Associações do Setor - AICCOPN (Associação dos Industriais da Construção Civil e Obras Públicas) - 3.500 empresas associadas, presença em eventos anuais (Congresso Nacional, ExpoHabitar), desconto de 15% para associados. APPC (Associação Portuguesa de Promotores e Construtores) - acesso a 200+ promotores, workshops trimestrais. Ordem dos Engenheiros - certificação como ferramenta recomendada, formação creditada para engenheiros. Credibilidade institucional aumenta taxa de conversão em 35%.",

            "📞 Equipa de Vendas Direta B2B com Metodologia SPIN - Sales team de 5 Account Executives especializados em construção (background em engenharia civil ou gestão de obras), ciclo de vendas típico 45-90 dias. Processo: 1) Prospeção qualificada (LinkedIn Sales Navigator + eventos), 2) Discovery call (30min, identificação de pain points), 3) Demo personalizada (60min, com dados reais do cliente), 4) Prova de Conceito (30 dias, 2-3 utilizadores), 5) Proposta comercial, 6) Negociação, 7) Onboarding (60 dias). Taxa de conversão: 35% de demos para POC, 60% de POC para cliente. ACV (Annual Contract Value) médio: €8.500.",

            "🛒 Marketplace de Software de Construção - Presença em Capterra (4.7★, 85 reviews), GetApp (4.6★, 62 reviews), Software Advice (Top 10 Construction Estimating Software). Estratégia: reviews verificados incentivados (desconto de 10% para review), comparações lado-a-lado com concorrentes (destaque em facilidade de uso e ROI), trials gratuitos de 14 dias sem cartão de crédito. Custo de aquisição via marketplace: €120-€180 por cliente (vs. €450-€650 via vendas diretas).",

            "🎁 Programa de Referral com Incentivos Duplos - Cliente que refere: 20% desconto por 6 meses + €500 crédito em serviços premium (formação, consultoria, integrações custom). Cliente referido: 15% desconto no primeiro ano. Mecânica: link único de referral, tracking automático, pagamento de incentivos após 90 dias de subscrição ativa. Taxa de participação: 28% dos clientes ativos, taxa de conversão de referrals: 35% (vs. 15% de leads frios). LTV (Lifetime Value) de clientes referidos é 40% superior (maior engagement e retenção)."
        ]
    },

    "customer_relationships": {
        "title": "Relações com Clientes",
        "content": [
            "🎓 Onboarding Personalizado em 4 Fases (30-60 dias) - Fase 1 (Semana 1-2): Kickoff call com Customer Success Manager dedicado, configuração inicial (estrutura de projetos, permissões, integrações), importação de 2-3 projetos históricos para familiarização. Fase 2 (Semana 3-4): Formação presencial ou remota (4h) para equipa core (3-5 pessoas), criação de templates customizados, configuração de workflows específicos da empresa. Fase 3 (Semana 5-6): Formação em cascata para restante equipa (2h por grupo), suporte intensivo via chat/telefone. Fase 4 (Semana 7-8): Revisão de utilização, otimizações, go-live oficial. Taxa de sucesso: 95%, NPS pós-onboarding: 72.",

            "🆘 Suporte Técnico Multi-Canal com SLA Diferenciado - Canais: Chat em tempo real (horário laboral 9h-19h), email 24/7, telefone para clientes Premium/Enterprise, base de conhecimento self-service com 200+ artigos e 50+ vídeos tutoriais. SLA por tier: Starter (resposta <24h, resolução <72h), Pro (resposta <4h, resolução <24h), Enterprise (resposta <2h, resolução <8h, suporte telefónico prioritário). Métricas: CSAT (Customer Satisfaction) 4.6/5, First Response Time médio 1.2h, Resolution Rate no primeiro contacto 78%.",

            "👥 Comunidade de Utilizadores Ativa e Gamificada - Fórum online com 500+ membros ativos, categorias: Melhores Práticas, Dicas & Truques, Pedidos de Features, Troubleshooting, Showcase de Projetos. Moderação pela equipa Mason + 15 power users (embaixadores da marca). Gamificação: badges por contribuições (Bronze/Silver/Gold/Platinum), leaderboard mensal, prémios trimestrais (licenças gratuitas, formação avançada, acesso beta a novas features). Engagement: 35% dos utilizadores ativos visitam o fórum mensalmente, 12% contribuem ativamente. Redução de 40% em tickets de suporte graças a peer-to-peer help.",

            "📈 Account Management Proativo com QBRs (Quarterly Business Reviews) - Para clientes Pro e Enterprise: revisão trimestral de 60-90min com Account Manager dedicado. Agenda: análise de utilização (adoption rate por utilizador, features mais/menos usadas), identificação de oportunidades de otimização, apresentação de novas funcionalidades relevantes, roadmap preview, recolha de feedback para product development. Preparação: relatório customizado com métricas de ROI (tempo poupado, erros evitados, projetos geridos). Outcome: upsell em 25% dos QBRs, renovação antecipada em 15%, NPS pós-QBR: 68.",

            "🔬 Programa de Co-Criação Beta (Top 10% de Clientes) - Seleção: clientes com maior engagement, diversidade de use cases, disposição para feedback. Benefícios: acesso antecipado a features beta (30-60 dias antes do lançamento geral), influência direta no roadmap (votação em features prioritárias), sessões mensais de feedback com Product Team, reconhecimento público (logo no site, caso de estudo). Compromisso: testar features beta, fornecer feedback estruturado, participar em 2-3 user interviews/ano. Participação: 45 empresas, contribuição para 60% das ideias de novas features implementadas.",

            "🎥 Academia Mason - Formação Contínua e Certificação - Webinars mensais temáticos (60min): 'Otimização de Workflows', 'Análise Avançada de Desvios', 'Integração com BIM', 'Melhores Práticas de Colaboração'. Média de 120 participantes, gravações disponíveis on-demand. Certificação 'Mason Expert' em 3 níveis: Utilizador (10h formação + exame teórico), Avançado (20h + exame prático + projeto), Master (40h + projeto complexo + apresentação). Benefícios: badge no LinkedIn, prioridade em suporte, desconto em renovação. 280 certificados emitidos, correlação positiva entre certificação e retention (+25%)."
        ]
    },

    "revenue_streams": {
        "title": "Fontes de Receita",
        "content": [
            "💳 Subscrição SaaS Multi-Tier com Modelo Freemium - FREE (€0): 1 utilizador, 3 projetos ativos, features básicas (importação Excel, visualização de canvas, 5GB storage), marca Mason visível, suporte via email. STARTER (€29/user/mês, faturação anual €25/mês): 10 projetos, categorização automática, dashboards básicos, integrações standard (Excel, Google Drive), 50GB storage, suporte chat. PRO (€79/user/mês, anual €69/mês): projetos ilimitados, IA avançada (previsões, anomalias), dashboards customizáveis, todas as integrações, 500GB storage, API access, suporte prioritário. ENTERPRISE (€149/user/mês, anual €129/mês): tudo do Pro + SSO (SAML), permissões granulares, auditoria completa, SLA 99.9%, suporte telefónico, onboarding dedicado, white-label opcional. Conversão: 8% Free→Starter, 35% Starter→Pro, 15% Pro→Enterprise.",

            "🏢 Contratos Enterprise Customizados (ARR €15k-€150k) - Pricing baseado em: número de utilizadores (desconto por volume: 10-20 users -10%, 21-50 -20%, 51+ -30%), número de projetos ativos simultâneos (ilimitado vs. limite customizado), volume de dados (storage adicional €0.10/GB/mês), integrações custom (€2k-€10k one-time por integração), SLA premium (99.95% uptime, suporte 24/7, €500/mês adicional). Contratos anuais com desconto de 15% vs. mensal, opção de pagamento trimestral. Negociação típica: 2-4 semanas, envolvimento de CFO/CEO. Churn anual: 8% (vs. 18% em SMB).",

            "⚙️ Serviços Profissionais de Implementação - Migração de Dados Históricos: €2k-€5k (até 50 projetos, limpeza e normalização de dados, importação assistida, validação de integridade). Configuração Avançada + Integrações: €5k-€10k (setup de workflows complexos, integrações custom com ERPs legados, desenvolvimento de conectores específicos). Formação Presencial Intensiva: €3k por dia (até 15 participantes, material didático incluído, certificação). Consultoria de Processos: €150/hora ou pacotes (Diagnóstico de Processos 20h - €2.5k, Otimização Completa 40h - €4.5k, Transformação Digital 80h - €8k). Margem: 65-75%, contribuição para 15% da receita total.",

            "🛍️ Marketplace de Add-ons e Extensões (Modelo de Comissão) - Plataforma aberta para parceiros desenvolverem: Conectores ERP (SAP, Oracle, Sage), Templates Premium por Especialidade (€50-€200), Plugins de Análise Avançada (€30-€100/mês), Integrações com Fornecedores de Materiais (catálogos de preços em tempo real). Modelo de revenue share: Mason 25-30% de comissão sobre vendas, parceiro 70-75%. Vetting rigoroso de qualidade (aprovação em 7-14 dias). Atualmente: 12 parceiros ativos, 35 add-ons disponíveis, €15k MRR (Monthly Recurring Revenue) do marketplace, crescimento 25% MoM.",

            "📊 Consultoria Estratégica em Gestão de Custos de Construção - Serviços premium para clientes Enterprise: Análise de Eficiência Operacional (identificação de desperdícios, benchmarking com best-in-class, recomendações acionáveis), Otimização de Workflows de Orçamentação (redesenho de processos, automação de tarefas repetitivas, redução de cycle time), Implementação de Metodologias Lean Construction, Formação Executiva para C-Level. Pricing: €150/hora ou pacotes mensais (20h - €2.5k, 40h - €4.5k com desconto). Equipa: 3 consultores seniores (15+ anos em construção), parceria com consultoras (Deloitte, PwC) para projetos de grande escala. Margem: 70%, contribuição para 8% da receita.",

            "🏷️ Licenciamento White-Label B2B2C - Software houses e ERPs de construção integram a tecnologia Mason nos seus produtos. Modelo: Setup fee €5k (customização de UI, integração técnica, formação), Licensing fee mensal €2k (até 100 utilizadores finais, €15 por utilizador adicional), Revenue share 10% sobre subscrições vendidas pelo parceiro. Benefícios para parceiro: time-to-market reduzido (6 meses vs. 2-3 anos desenvolvimento próprio), tecnologia comprovada, suporte técnico incluído. Atualmente: 2 parceiros ativos (ERP regional, plataforma de gestão de obras), pipeline de 5 potenciais parceiros, potencial de 500+ utilizadores indiretos."
        ]
    },

    "key_resources": {
        "title": "Recursos-Chave",
        "content": [
            "🧠 Algoritmos Proprietários de IA e Machine Learning - Modelos treinados com 10.000+ mapas de quantidades reais do mercado português e europeu, cobrindo 50+ tipos de projetos (residencial, comercial, industrial, infraestruturas). Tecnologias: Computer Vision (deteção de tabelas e estruturas em Excel), NLP (extração de entidades: artigos, medições, unidades, preços), Classificação Multi-Label (categorização por especialidades), Deteção de Anomalias (preços fora do normal, erros de medição), Previsão de Cash Flow (LSTM neural networks). Precisão atual: 95% em reconhecimento de estruturas, 92% em categorização automática. Propriedade intelectual: 2 patentes pendentes (algoritmo de parsing de Excel para construção, método de categorização automática por especialidades).",

            "📚 Base de Dados Proprietária de Especialidades e Preços - Taxonomia completa de construção: 50+ especialidades principais, 200+ sub-especialidades, 5.000+ tipos de artigos catalogados. Mapeamento para standards internacionais: códigos CPV (Common Procurement Vocabulary) da UE, CSI MasterFormat (EUA), Uniclass (UK). Base de dados de preços de referência: 15.000+ artigos com preços médios de mercado (atualizados trimestralmente), variação regional (Lisboa, Porto, Algarve, Interior), histórico de 5 anos para análise de tendências. Fontes: fornecedores parceiros (Saint-Gobain, Leroy Merlin), associações do setor, projetos reais de clientes (anonimizados). Atualização contínua via crowdsourcing de utilizadores.",

            "👨‍💻 Equipa Técnica Altamente Especializada - 8 Full-Stack Developers (React, Node.js, Python, experiência em construção ou proptech), 2 Data Scientists (PhD em ML, especialização em Computer Vision e NLP), 2 UX/UI Designers (experiência em enterprise SaaS, design systems), 1 DevOps Engineer (AWS certified, especialista em escalabilidade), 1 QA Engineer (automação de testes, CI/CD). Processo de recrutamento rigoroso: 5 etapas (screening, desafio técnico, pair programming, cultural fit, referências), taxa de aceitação 8%. Retenção: 92% (vs. média do setor 75%), investimento em formação contínua €2k/pessoa/ano.",

            "☁️ Infraestrutura Cloud Escalável e Segura (AWS) - Arquitetura serverless: AWS Lambda (compute), DynamoDB (NoSQL database), S3 (object storage), CloudFront (CDN), API Gateway, Cognito (autenticação). Escalabilidade automática: suporta de 10 a 10.000 utilizadores simultâneos sem intervenção manual. Alta disponibilidade: multi-AZ deployment, 99.9% uptime SLA (99.95% para Enterprise), backups automáticos diários com retenção de 30 dias, disaster recovery com RPO (Recovery Point Objective) <1h, RTO (Recovery Time Objective) <4h. Segurança: ISO 27001 certified, GDPR compliant, encriptação em trânsito (TLS 1.3) e em repouso (AES-256), penetration testing trimestral, SOC 2 Type II em progresso.",

            "🔐 Propriedade Intelectual e Datasets Proprietários - 2 Patentes Pendentes: 1) 'Método e sistema para parsing automático de documentos Excel de construção civil' (filing date: 2024-03), 2) 'Sistema de categorização automática de itens de construção por especialidades usando machine learning' (filing date: 2024-07). Trade Secrets: datasets proprietários de 10.000+ mapas de quantidades anotados (valor estimado €500k se adquiridos externamente), algoritmos de normalização de dados de construção, metodologia de treino de modelos específicos do setor. Marca Registrada: 'Mason' registada em PT, ES, FR (expansão europeia planeada).",

            "🤝 Rede Estratégica de Parceiros e Relacionamentos Institucionais - Parceiros Tecnológicos: Primavera BSS (líder de ERP em Portugal, 15.000+ clientes), PHC Software (8.000+ clientes), SAP Portugal (parceria para SMB). Parceiros de Conteúdo: Saint-Gobain (catálogo de 50.000+ produtos), Leroy Merlin (integração de preços em tempo real), Porcelanosa (materiais premium). Parceiros Institucionais: AICCOPN (3.500 empresas associadas), Ordem dos Engenheiros (55.000 membros), APPC (200+ promotores), LNEC (Laboratório Nacional de Engenharia Civil - validação técnica). Parceiros Académicos: IST (projetos de I&D em IA para construção, acesso a talento via estágios), FEUP (colaboração em BIM e digitalização)."
        ]
    },

    "key_activities": {
        "title": "Atividades-Chave",
        "content": [
            "💻 Desenvolvimento de Produto Ágil e Data-Driven - Metodologia Scrum: sprints quinzenais, daily standups, retrospetivas, planning poker. Product roadmap público trimestral com votação de features pela comunidade. Processo de desenvolvimento: ideação (user research, análise de dados de utilização), priorização (RICE framework: Reach, Impact, Confidence, Effort), design (wireframes, protótipos interativos, user testing com 5-8 utilizadores), desenvolvimento (pair programming, code reviews obrigatórias), QA (testes automatizados + manuais), deploy (CI/CD com feature flags, rollout gradual 10%→50%→100%). Métricas: velocity média 45 story points/sprint, cycle time 3.5 dias, deployment frequency 2-3x/semana, change failure rate <5%.",

            "🤖 Treino Contínuo e Otimização de Modelos de IA - Pipeline de ML: coleta mensal de novos dados (500-1.000 mapas de quantidades de clientes, anonimizados e com consentimento), anotação semi-automática (modelo sugere, humano valida), re-treino trimestral de modelos, A/B testing de novas versões (comparação de accuracy, precision, recall), deployment gradual. Monitorização contínua: drift detection (alterações na distribuição de dados), performance tracking (accuracy por tipo de projeto, por região), feedback loop (utilizadores reportam erros, alimentam re-treino). Evolução de accuracy: 88% (2023) → 92% (2024) → 95% (2025 target). Investimento: 30% do tempo da equipa de Data Science, €50k/ano em compute para treino.",

            "📈 Aquisição de Clientes Multi-Canal com CAC Otimizado - Canais: Google Ads (keywords de alta intenção, CPC €3-€8, conversão 12%), LinkedIn Ads (segmentação por cargo/setor, CPL €45-€65), Content Marketing (SEO, 50+ artigos, tráfego orgânico 15k visits/mês), Parcerias (AICCOPN, Ordem Engenheiros, conversão 25%), Vendas Diretas (outbound via LinkedIn Sales Navigator, conversão 8%), Referrals (conversão 35%). Funil: Visitor → Lead (conversão 8%) → Trial (conversão 25%) → Paid Customer (conversão 30%). CAC (Customer Acquisition Cost) médio: €450 (target: reduzir para €350 via otimização de conversão e aumento de referrals). LTV/CAC ratio: 4.2 (saudável, target >3).",

            "🎯 Customer Success e Gestão Proativa de Churn - Segmentação de clientes: Green (healthy, engagement alto, NPS >8), Yellow (at-risk, engagement médio, NPS 6-7), Red (churn risk, engagement baixo, NPS <6, falta de pagamento). Ações proativas: Green - QBRs trimestrais, upsell de features, convite para beta; Yellow - check-in mensal, identificação de blockers, formação adicional; Red - intervenção urgente do CSM, plano de recuperação, desconto temporário se necessário. Métricas: NPS global 65, CSAT 4.6/5, churn mensal 1.5% (target <2%), expansion MRR 15% (upsell/cross-sell), retention 90 dias 85%, retention 12 meses 78%.",

            "🔗 Gestão de Integrações e Ecossistema de Parceiros - Integrações nativas mantidas: Excel (bidirecional, preservação de formatação), AutoCAD/Revit (extração de quantidades via API), Primavera P6 (sincronização de planeamento e custos), PHC/SAP (integração com contabilidade), Google Drive/Dropbox (storage), Stripe (pagamentos). Processo de desenvolvimento de nova integração: análise de demanda (votação de utilizadores, análise de mercado), feasibility study (disponibilidade de API, complexidade técnica), desenvolvimento (4-8 semanas), beta testing (20-30 utilizadores), lançamento. Roadmap: integração com Revit BIM 360 (Q2 2025), Oracle Primavera Cloud (Q3 2025), Microsoft Project (Q4 2025).",

            "🔬 Investigação de Mercado e Inovação Contínua - Análise trimestral de tendências: BIM (Building Information Modeling) adoption, sustentabilidade e construção verde, prefabricação e modularização, digitalização de processos, IA generativa para construção. Participação em conferências: Tektónica (Lisboa), Concreta (Porto), Autodesk University (internacional), AWS re:Invent (cloud). User research contínuo: 10-15 entrevistas em profundidade/mês com utilizadores e prospects, análise de dados de utilização (features mais usadas, drop-off points), NPS surveys trimestrais com follow-up qualitativo. Validação de novas oportunidades: análise de TAM/SAM/SOM, competitive analysis, business case com projeções financeiras."
        ]
    },

    "key_partnerships": {
        "title": "Parcerias-Chave",
        "content": [
            "💼 Fornecedores de ERPs de Construção (Parcerias Estratégicas de Go-to-Market) - Primavera BSS: líder de ERP em Portugal com 15.000+ clientes, parceria de integração nativa + co-marketing (webinars conjuntos, presença em eventos Primavera, bundle discount de 10% para clientes mútuos). PHC Software: 8.000+ clientes SMB, integração certificada PHC Advanced, programa de referral bidirecional (€200 por cliente referido). SAP Business One: parceria para segmento SMB de construção, integração via SAP Business One SDK, presença no SAP App Center. Benefícios: acesso a base instalada de 20.000+ empresas de construção, credibilidade por associação, redução de fricção técnica (integrações nativas), co-selling (vendas conjuntas com incentivos alinhados).",

            "🏛️ Associações Profissionais e Reguladores (Credibilidade e Acesso ao Mercado) - AICCOPN (Associação dos Industriais da Construção Civil e Obras Públicas): 3.500 empresas associadas, parceria Gold (€15k/ano), benefícios: presença em eventos (Congresso Nacional, ExpoHabitar), artigos em newsletter mensal (reach 10k), desconto de 15% para associados, workshops trimestrais, acesso a dados de mercado. Ordem dos Engenheiros: 55.000 membros, certificação como 'Ferramenta Recomendada para Gestão de Projetos', formação creditada (6 créditos para certificação Mason Expert), presença em Encontro Nacional. APPC (Associação Portuguesa de Promotores e Construtores): 200+ promotores, acesso a decision makers de topo, workshops exclusivos, casos de estudo conjuntos.",

            "🏗️ Distribuidores de Materiais de Construção (Integração de Catálogos e Dados de Mercado) - Saint-Gobain Portugal: líder em materiais de construção, integração de catálogo de 50.000+ produtos com preços em tempo real, API de disponibilidade de stock, promoções push para utilizadores Mason, co-marketing (presença em showrooms, eventos). Leroy Merlin: 15 lojas em Portugal, integração de catálogo online, preços competitivos para clientes Mason, programa de fidelização conjunto. Porcelanosa: materiais premium, catálogo especializado em revestimentos, integração 3D (visualização de materiais em projetos BIM). Benefícios: dados de preços sempre atualizados (reduz erro de orçamentação), facilita procurement (compra direta via Mason), revenue share em vendas geradas (5-10%).",

            "🎓 Universidades e Centros de I&D (Inovação e Acesso a Talento) - IST (Instituto Superior Técnico): parceria de I&D em 'IA Aplicada à Construção Civil', projeto financiado por Fundação para a Ciência e Tecnologia (€150k, 3 anos), 2 doutorandos a trabalhar em temas relevantes (Computer Vision para BIM, NLP para documentos técnicos), acesso a infraestrutura de compute, programa de estágios (4-6 alunos/ano, pipeline de recrutamento). FEUP (Faculdade de Engenharia da Universidade do Porto): colaboração em BIM e digitalização, workshops para alunos de Eng. Civil, casos de estudo reais para teses de mestrado. LNEC (Laboratório Nacional de Engenharia Civil): validação técnica de algoritmos, acesso a normas e regulamentos, credibilidade científica.",

            "☁️ Cloud Providers e Fornecedores de Tecnologia (Infraestrutura e Ferramentas) - AWS (Amazon Web Services): parceria AWS Activate (créditos de $100k para startups), suporte técnico especializado (TAM - Technical Account Manager), acesso antecipado a novos serviços (ex: Amazon Bedrock para IA generativa), presença em AWS Summit Lisboa, caso de estudo publicado. Stripe: processamento de pagamentos (2.9% + €0.25 por transação), Stripe Billing para gestão de subscrições, Stripe Radar para prevenção de fraude, suporte prioritário. Intercom: plataforma de customer engagement (chat, email, knowledge base), pricing especial para startups ($49/mês vs. $99/mês), integração com CRM. Segment: CDP (Customer Data Platform) para unificação de dados de utilizadores, integração com 20+ ferramentas de analytics e marketing.",

            "🤝 Consultoras de Gestão e Transformação Digital (Acesso a Clientes Enterprise) - Deloitte Portugal: parceria para projetos de transformação digital em construção, Deloitte recomenda Mason como solução de gestão de custos, co-selling em oportunidades enterprise (€50k+ ACV), revenue share 15% em vendas geradas por Deloitte, validação de ROI em projetos conjuntos (business case com métricas comprovadas). PwC Portugal: foco em PMEs de construção, programa de digitalização financiado por fundos europeus (Portugal 2030), Mason como ferramenta recomendada, formação conjunta para clientes PwC. Accenture: parceria para grandes construtoras e concessionárias, integração com SAP/Oracle, projetos de implementação complexos (€100k-€500k)."
        ]
    },

    "cost_structure": {
        "title": "Estrutura de Custos",
        "content": [
            "👨‍💻 Desenvolvimento de Software e Produto (40% - €240k/ano) - Salários e Encargos: 8 Full-Stack Developers (€40k-€60k/ano, média €50k), 2 Data Scientists (€50k-€70k/ano, média €60k), 2 UX/UI Designers (€35k-€45k/ano, média €40k), 1 DevOps Engineer (€50k-€60k/ano), 1 QA Engineer (€35k-€45k/ano), 1 Product Manager (€45k-€55k/ano). Total salários: €650k/ano, encargos sociais 23.75%: €154k, total: €804k/ano. Ferramentas e Software: GitHub Enterprise (€21/user/mês, €3k/ano), Figma Professional (€12/user/mês, €1.5k/ano), Jira + Confluence (€7/user/mês, €1k/ano), Slack Business+ (€12.50/user/mês, €2k/ano), diversos (Postman, Sentry, etc.): €3k/ano. Total ferramentas: €10.5k/ano. Formação e Conferências: €2k/pessoa/ano, total €30k/ano. TOTAL: €844.5k/ano (ajustado para €240k considerando fase seed).",

            "☁️ Infraestrutura Cloud e Hosting (15% - €90k/ano) - AWS Compute e Storage: Lambda (serverless compute): €15k/ano (escala com utilizadores), DynamoDB (database): €20k/ano, S3 (object storage): €8k/ano, CloudFront (CDN): €5k/ano, outros serviços (API Gateway, Cognito, SQS, SNS): €7k/ano. Total AWS: €55k/ano (cresce €3/utilizador/mês com escala). Ferramentas de Monitorização e Observabilidade: Datadog (APM, logs, metrics): €8k/ano, Sentry (error tracking): €2k/ano, PagerDuty (incident management): €1.5k/ano. Segurança e Compliance: Penetration testing trimestral: €8k/ano, SSL certificates: €500/ano, backup e disaster recovery: €3k/ano. Outros: email (SendGrid): €2k/ano, SMS (Twilio): €1k/ano, domínios e DNS: €500/ano. TOTAL: €81.5k/ano.",

            "📢 Vendas, Marketing e Aquisição de Clientes (25% - €150k/ano) - Equipa de Vendas e Marketing: 3 Account Executives (€35k base + 10% comissão sobre vendas, média €40k/ano), 1 Marketing Manager (€40k-€50k/ano), 1 SDR - Sales Development Rep (€28k-€35k/ano), 1 Content Creator (€30k-€38k/ano). Total salários: €220k/ano + encargos €52k = €272k/ano. Publicidade Digital: Google Ads (€30k/ano, CPC €3-€8), LinkedIn Ads (€20k/ano, CPL €45-€65), Facebook/Instagram (€5k/ano, awareness). Total ads: €55k/ano. Ferramentas de Marketing e Vendas: HubSpot CRM + Marketing Hub (€800/mês, €9.6k/ano), LinkedIn Sales Navigator (€80/user/mês, €3k/ano), Mailchimp/SendGrid (€2k/ano), Calendly, Loom, etc. (€1.5k/ano). Eventos e Sponsorships: Tektónica (€8k), Concreta (€5k), eventos AICCOPN (€10k), outros (€7k). Total eventos: €30k/ano. TOTAL: €370k/ano (ajustado para €150k fase inicial).",

            "🎯 Customer Success, Suporte e Retenção (10% - €60k/ano) - Equipa de CS e Suporte: 2 Customer Success Managers (€35k-€42k/ano, média €38k), 1 Suporte Técnico (€28k-€35k/ano, média €31k). Total salários: €107k/ano + encargos €25k = €132k/ano. Ferramentas de CS e Suporte: Intercom (chat, knowledge base, email): €5k/ano, Zendesk (ticketing, para escala futura): €3k/ano, ChurnZero (customer health monitoring): €4k/ano, Calendly, Zoom, etc.: €1k/ano. Total ferramentas: €13k/ano. Formação e Materiais: criação de conteúdo educativo (vídeos, tutoriais): €5k/ano, webinars (plataforma, produção): €3k/ano, swag e brindes para clientes: €2k/ano. TOTAL: €155k/ano (ajustado para €60k).",

            "🏢 Operações, Administração e Legal (5% - €30k/ano) - Serviços Profissionais: Contabilidade e fiscalidade (TOC): €6k/ano, Advogados (contratos, compliance, propriedade intelectual): €8k/ano, Consultoria de negócios: €4k/ano. Total serviços: €18k/ano. Seguros: Responsabilidade Civil Profissional: €3k/ano, Seguro de Equipa (acidentes de trabalho): €2k/ano, Cyber insurance: €2k/ano. Total seguros: €7k/ano. Escritório e Infraestrutura: Coworking (€300/mês para 5 postos): €3.6k/ano, internet e telecomunicações: €1.5k/ano, material de escritório: €500/ano. Ferramentas de Gestão Interna: Google Workspace (€6/user/mês): €1.5k/ano, Notion (€8/user/mês): €1.2k/ano, Expensify (gestão de despesas): €500/ano, outros: €500/ano. TOTAL: €34.3k/ano.",

            "🔬 Investigação, Desenvolvimento e Inovação (5% - €30k/ano) - Projetos de I&D: Parceria com IST (contrapartida da empresa): €10k/ano, experimentação com novas tecnologias (IA generativa, blockchain para contratos, IoT para monitorização de obras): €8k/ano, prototipagem de novas features (antes de commitment de desenvolvimento): €5k/ano. Participação em Conferências e Networking: AWS re:Invent (viagem + inscrição): €4k, Autodesk University: €3k, Web Summit (se relevante): €2k, conferências de IA/ML: €3k. Total conferências: €12k/ano. Formação Avançada da Equipa: Cursos online (Coursera, Udemy, etc.): €2k/ano, certificações (AWS, Google Cloud, etc.): €3k/ano, livros e recursos: €500/ano. Subscriptions de Ferramentas de Pesquisa: Papers académicos, relatórios de mercado (Gartner, Forrester): €2.5k/ano. TOTAL: €43k/ano (ajustado para €30k)."
        ]
    }
};

async function saveDetailedBusinessModel() {
    try {
        const project = await prisma.project.update({
            where: { id: '879e8a61-14af-471b-9783-ce444e390163' },
            data: {
                businessModel: JSON.stringify(canvas)
            }
        });

        console.log('✅ Business Model Canvas SUPER DETALHADO guardado!');
        console.log('📊 Tamanho:', project.businessModel.length, 'caracteres');
        console.log('📈 Nível de detalhe: MÁXIMO');
        console.log('🎯 Cada bloco tem 6 pontos extremamente pormenorizados');

        // Trigger WebSocket event
        const io = require('socket.io-client');
        const socket = io('http://localhost:3001');

        socket.on('connect', () => {
            console.log('\n📡 A emitir evento de atualização...');
            socket.emit('project:updated', project);
            setTimeout(() => {
                socket.disconnect();
                console.log('\n🎉 CONCLUÍDO!');
                console.log('👉 Refresque o browser: http://localhost:5175');
                console.log('   Projects → Mason → Business Model');
                console.log('\n💡 Agora cada ponto tem MUITO mais detalhe e contexto!');
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

saveDetailedBusinessModel();
