import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Printer, TrendingUp, Users, DollarSign, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const BusinessModelDocument = ({ projects = [], refreshProjects, onToggleSidebar }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [canvasData, setCanvasData] = useState(null);
    const documentRef = useRef(null);

    const colors = {
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#059669',
        bg: '#000000',
        card: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        textMuted: '#8A8A8A'
    };

    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects]);

    useEffect(() => {
        const project = projects.find(p => p.id === selectedProjectId);
        if (project && project.businessModel && project.businessModel !== '{}') {
            try {
                const data = typeof project.businessModel === 'string' ? JSON.parse(project.businessModel) : project.businessModel;
                setCanvasData(data);
            } catch (e) {
                console.error("Failed to parse business model", e);
                setCanvasData(null);
            }
        } else {
            setCanvasData(null);
        }
    }, [selectedProjectId, projects]);

    const activeProject = projects.find(p => p.id === selectedProjectId);

    // Print functionality
    const handlePrint = () => {
        window.print();
    };

    // Export to PDF functionality (Design Agent - fixed colors)
    const handleExportPDF = () => {
        const element = documentRef.current;

        // Apply PDF export mode class for dark text on white background
        element.classList.add('pdf-export-mode');

        const opt = {
            margin: [10, 10],
            filename: `${activeProject?.name || 'Mason'}_Business_Model_Canvas.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Remove class after PDF generation
            element.classList.remove('pdf-export-mode');
        });
    };

    if (!canvasData) {
        return (
            <div style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: colors.bg }}>
                <div style={{
                    width: '80px', height: '80px', backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <FileText size={40} style={{ color: colors.primary }} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>Sem Modelo de Negócio</h2>
                <p style={{ fontSize: '16px', color: colors.textMuted, maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                    Ainda não foi gerado um Business Model Canvas para o projeto **{activeProject?.name || 'selecionado'}**.
                    <br /><br />
                    Pode solicitar a geração automática no **Chat de Comando**:
                    <br />
                    *"Gera um Business Model Canvas para este projeto"*
                </p>
            </div>
        );
    }

    const Section = ({ title, icon: Icon, children }) => (
        <div style={{ marginBottom: '48px', pageBreakInside: 'avoid' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '12px',
                borderBottom: `2px solid ${colors.primary}`
            }}>
                {Icon && <Icon size={28} style={{ color: colors.primary }} />}
                <h2 style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'white',
                    letterSpacing: '-0.02em'
                }}>
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );

    const ContentList = ({ items }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {items && items.map((item, i) => (
                <div key={i} style={{
                    padding: '20px 24px',
                    backgroundColor: colors.card,
                    borderLeft: `4px solid ${colors.primary}`,
                    borderRadius: '8px',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: 'rgba(255,255,255,0.9)'
                }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{
                            color: colors.primary,
                            fontWeight: 700,
                            fontSize: '18px',
                            minWidth: '24px'
                        }}>
                            {i + 1}.
                        </span>
                        <div style={{ flex: 1 }}>
                            {typeof item === 'object' ? item.text || JSON.stringify(item) : item}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const Table = ({ headers, rows }) => (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: colors.card,
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <thead>
                    <tr style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                        {headers.map((header, i) => (
                            <th key={i} style={{
                                padding: '16px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '14px',
                                color: colors.primary,
                                borderBottom: `2px solid ${colors.primary}`
                            }}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{
                            borderBottom: `1px solid ${colors.border}`,
                            transition: 'background 0.2s'
                        }}>
                            {row.map((cell, j) => (
                                <td key={j} style={{
                                    padding: '14px 16px',
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.8)'
                                }}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Revenue Projections Chart Component
    const RevenueChart = ({ data, type = 'monthly' }) => {
        const maxValue = Math.max(...data.map(d => type === 'monthly' ? d.mrr : d.total_revenue));

        return (
            <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.map((item, i) => {
                        const value = type === 'monthly' ? item.mrr : item.total_revenue;
                        const percentage = (value / maxValue) * 100;
                        const label = type === 'monthly' ? item.month : `Ano ${item.year}`;

                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ minWidth: '60px', fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                    {label}
                                </div>
                                <div style={{ flex: 1, position: 'relative', height: '36px', backgroundColor: colors.card, borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${percentage}%`,
                                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                                        transition: 'width 0.5s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: '12px'
                                    }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>
                                            €{value.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {type === 'monthly' && (
                                    <div style={{ minWidth: '80px', fontSize: '13px', color: colors.textMuted }}>
                                        {item.customers} clientes
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px',
            backgroundColor: colors.bg,
            minHeight: '100vh'
        }}>
            <div ref={documentRef} id="business-model-document">
                {/* Document Header */}
                <div style={{
                    marginBottom: '48px',
                    paddingBottom: '32px',
                    borderBottom: `3px solid ${colors.primary}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                        <div>
                            <div style={{
                                display: 'inline-block',
                                padding: '8px 16px',
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                border: `1px solid ${colors.primary}`,
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: colors.primary,
                                marginBottom: '16px'
                            }}>
                                BUSINESS MODEL CANVAS
                            </div>
                            <h1 style={{
                                margin: '0 0 12px 0',
                                fontSize: '48px',
                                fontWeight: 900,
                                color: 'white',
                                letterSpacing: '-0.03em'
                            }}>
                                {activeProject?.name || 'Projeto'}
                            </h1>
                            <p style={{
                                margin: 0,
                                fontSize: '18px',
                                color: colors.textMuted,
                                lineHeight: 1.6
                            }}>
                                {canvasData.metadata?.domain || 'Plataforma de Soluções Inteligentes'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
                            <button onClick={handlePrint} style={{
                                padding: '12px 20px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => e.target.style.borderColor = colors.primary}
                                onMouseLeave={(e) => e.target.style.borderColor = colors.border}
                            >
                                <Printer size={18} />
                                Imprimir
                            </button>
                            <button onClick={handleExportPDF} style={{
                                padding: '12px 20px',
                                backgroundColor: colors.primary,
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondary}
                                onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary}
                            >
                                <Download size={18} />
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginTop: '24px'
                    }}>
                        <div style={{ padding: '12px', backgroundColor: colors.card, borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Metodologia</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                {canvasData.metadata?.methodology || 'Business Model Canvas'}
                            </div>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: colors.card, borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Gerado por</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                {canvasData.metadata?.generated_by}
                            </div>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: colors.card, borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Versão</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                {canvasData.metadata?.version || '1.0'}
                            </div>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: colors.card, borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Data</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                {canvasData.metadata?.generated_at ? new Date(canvasData.metadata.generated_at).toLocaleDateString('pt-PT') : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Agent Attribution */}
                    {canvasData.metadata?.agents_used && Array.isArray(canvasData.metadata.agents_used) && (
                        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'rgba(124, 58, 237, 0.05)', border: `1px solid rgba(124, 58, 237, 0.2)`, borderRadius: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: colors.secondary, marginBottom: '12px' }}>
                                🤝 Colaboração Multi-Agent
                            </div>
                            {canvasData.metadata.agents_used.map((agent, i) => (
                                <div key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
                                    <strong style={{ color: 'white' }}>{agent.agent || agent.name}:</strong> {agent.contribution || agent.role}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Executive Summary */}
                <Section title="Sumário Executivo" icon={FileText}>
                    <div style={{
                        padding: '24px',
                        backgroundColor: 'rgba(37, 99, 235, 0.05)',
                        border: `1px solid rgba(37, 99, 235, 0.2)`,
                        borderRadius: '12px',
                        fontSize: '16px',
                        lineHeight: '1.8',
                        color: 'rgba(255,255,255,0.9)'
                    }}>
                        {canvasData.executive_summary ? (
                            <>
                                {typeof canvasData.executive_summary === 'string' ? (
                                    <p style={{ margin: 0 }}>{canvasData.executive_summary}</p>
                                ) : (
                                    canvasData.executive_summary.paragraphs && canvasData.executive_summary.paragraphs.map((p, i) => (
                                        <p key={i} style={{ margin: i === canvasData.executive_summary.paragraphs.length - 1 ? 0 : '0 0 16px 0' }}>
                                            {p}
                                        </p>
                                    ))
                                )}
                            </>
                        ) : (
                            <>
                                <p style={{ margin: '0 0 16px 0' }}>
                                    O <strong>{activeProject?.name || 'Projeto'}</strong> é uma solução estratégica inovadora potenciada por inteligência artificial para otimização de workflow e inteligência de negócio.
                                </p>
                                <p style={{ margin: 0 }}>
                                    Este documento apresenta o Business Model Canvas completo, detalhando os 9 blocos fundamentais do modelo de negócio e incluindo projeções financeiras detalhadas para os próximos 3 anos.
                                </p>
                            </>
                        )}
                    </div>
                </Section>

                {/* Customer Segments */}
                <Section title="Segmentos de Clientes" icon={Users}>
                    <ContentList items={canvasData.customer_segments?.content || []} />
                </Section>

                {/* Value Propositions */}
                <Section title="Propostas de Valor" icon={Target}>
                    <ContentList items={canvasData.value_propositions?.content || []} />
                </Section>

                {/* Channels */}
                <Section title="Canais de Distribuição">
                    <ContentList items={canvasData.channels?.content || []} />
                </Section>

                {/* Customer Relationships */}
                <Section title="Relacionamento com Clientes">
                    <ContentList items={canvasData.customer_relationships?.content || []} />
                </Section>

                {/* Revenue Streams */}
                <Section title="Fontes de Receita" icon={DollarSign}>
                    <ContentList items={canvasData.revenue_streams?.content || []} />

                    {/* Pricing Table */}
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                            Tabela de Preços SaaS
                        </h3>
                        {canvasData.revenue_streams?.pricing_table && canvasData.revenue_streams.pricing_table.headers ? (
                            <Table
                                headers={canvasData.revenue_streams.pricing_table.headers}
                                rows={canvasData.revenue_streams.pricing_table.rows}
                            />
                        ) : canvasData.pricing_table ? (
                            <Table
                                headers={['Plano', 'Preço', 'Funcionalidades']}
                                rows={canvasData.pricing_table.map(p => [p.tier || p.plan, p.price, p.features])}
                            />
                        ) : (
                            <Table
                                headers={['Plano', 'Preço/Mês', 'Utilizadores', 'Projetos', 'Features Principais']}
                                rows={[
                                    ['FREE', '€0', '1', '3', 'Features básicas, 5GB storage'],
                                    ['STARTER', '€29', 'Ilimitado', '10', 'Categorização automática, 50GB'],
                                    ['PRO', '€79', 'Ilimitado', 'Ilimitado', 'IA avançada, API, 500GB'],
                                    ['ENTERPRISE', '€149', 'Ilimitado', 'Ilimitado', 'SSO, SLA 99.9%, suporte 24/7']
                                ]}
                            />
                        )}
                    </div>
                </Section>

                {/* Financial Projections Section - NEW! */}
                {canvasData.financial_projections && (
                    <Section title="Projeções Financeiras e Crescimento" icon={TrendingUp}>
                        <div style={{
                            padding: '24px',
                            backgroundColor: 'rgba(5, 150, 105, 0.05)',
                            border: `1px solid rgba(5, 150, 105, 0.2)`,
                            borderRadius: '12px',
                            marginBottom: '32px'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: colors.accent, marginBottom: '12px' }}>
                                📊 Metodologia: {canvasData.financial_projections.methodology}
                            </div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                                Projeções baseadas em análise de mercado, benchmarking de SaaS similares e assumptions conservadoras de crescimento.
                            </div>
                        </div>

                        {/* Market Size */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                                Dimensão de Mercado
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                <div style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', borderLeft: `4px solid ${colors.primary}` }}>
                                    <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>TAM (Total Addressable Market)</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>
                                        {canvasData.financial_projections.assumptions.market_size.tam}
                                    </div>
                                </div>
                                <div style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', borderLeft: `4px solid ${colors.secondary}` }}>
                                    <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>SAM (Serviceable Available Market)</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>
                                        {canvasData.financial_projections.assumptions.market_size.sam}
                                    </div>
                                </div>
                                <div style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', borderLeft: `4px solid ${colors.accent}` }}>
                                    <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>SOM (Serviceable Obtainable Market)</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>
                                        {canvasData.financial_projections.assumptions.market_size.som}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Projections */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                                Projeções Mensais - Ano 1 (MRR - Monthly Recurring Revenue)
                            </h3>
                            <RevenueChart data={canvasData.financial_projections.monthly_projections_year1} type="monthly" />
                        </div>

                        {/* Annual Projections */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                                Projeções Anuais - 3 Anos
                            </h3>
                            <RevenueChart data={canvasData.financial_projections.annual_projections} type="annual" />

                            {/* Detailed Annual Table */}
                            <div style={{ marginTop: '24px' }}>
                                <Table
                                    headers={['Ano', 'Receita Total', 'MRR (fim)', 'ARR', 'Clientes', 'CAC', 'LTV', 'LTV/CAC', 'Margem']}
                                    rows={canvasData.financial_projections.annual_projections.map(year => [
                                        `Ano ${year.year}`,
                                        `€${(year.total_revenue / 1000).toFixed(0)}k`,
                                        `€${(year.metrics.mrr_end / 1000).toFixed(0)}k`,
                                        `€${(year.metrics.arr / 1000).toFixed(0)}k`,
                                        year.customers.starter + year.customers.pro + year.customers.enterprise,
                                        `€${year.metrics.cac}`,
                                        `€${year.metrics.ltv}`,
                                        year.metrics.ltv_cac_ratio.toFixed(1),
                                        year.metrics.gross_margin
                                    ])}
                                />
                            </div>
                        </div>

                        {/* Scenarios */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                                Cenários de Crescimento (Ano 3)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                {Object.entries(canvasData.financial_projections.scenarios).map(([key, scenario]) => (
                                    <div key={key} style={{
                                        padding: '20px',
                                        backgroundColor: colors.card,
                                        borderRadius: '12px',
                                        border: key === 'base' ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`
                                    }}>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px', textTransform: 'capitalize' }}>
                                            {key === 'conservative' ? '🐢 Conservador' : key === 'base' ? '🎯 Base' : '🚀 Otimista'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '12px' }}>
                                            {scenario.description}
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: colors.primary, marginBottom: '4px' }}>
                                            €{(scenario.year3_revenue / 1000000).toFixed(1)}M
                                        </div>
                                        <div style={{ fontSize: '12px', color: colors.textMuted }}>
                                            {scenario.year3_customers} clientes
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                                            {scenario.assumptions}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Metrics Targets */}
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                                Métricas-Chave e Targets
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                {Object.entries(canvasData.financial_projections.key_metrics_targets).map(([key, value]) => (
                                    <div key={key} style={{ padding: '16px', backgroundColor: colors.card, borderRadius: '8px' }}>
                                        <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {key.replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>
                )}

                {/* Key Resources */}
                <Section title="Recursos-Chave">
                    <ContentList items={canvasData.key_resources?.content || []} />
                </Section>

                {/* Key Activities */}
                <Section title="Atividades-Chave">
                    <ContentList items={canvasData.key_activities?.content || []} />
                </Section>

                {/* Key Partnerships */}
                <Section title="Parcerias Estratégicas">
                    <ContentList items={canvasData.key_partnerships?.content || []} />
                </Section>

                {/* Cost Structure */}
                <Section title="Estrutura de Custos" icon={TrendingUp}>
                    <ContentList items={canvasData.cost_structure?.content || []} />

                    {/* Cost Breakdown Table */}
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                            Breakdown de Custos Anuais
                        </h3>
                        {canvasData.cost_structure?.cost_breakdown && canvasData.cost_structure.cost_breakdown.headers ? (
                            <Table
                                headers={canvasData.cost_structure.cost_breakdown.headers}
                                rows={canvasData.cost_structure.cost_breakdown.rows}
                            />
                        ) : canvasData.cost_breakdown ? (
                            <Table
                                headers={['Categoria', 'Percentagem', 'Detalhe']}
                                rows={canvasData.cost_breakdown.map(c => [c.category, `${c.percentage}%`, c.detail])}
                            />
                        ) : (
                            <Table
                                headers={['Categoria', 'Percentagem', 'Valor Anual (estimado)', 'Descrição']}
                                rows={[
                                    ['Desenvolvimento', '40%', '€240k', 'Salários equipa técnica + ferramentas'],
                                    ['Vendas & Marketing', '25%', '€150k', 'Equipa comercial + publicidade'],
                                    ['Infraestrutura', '15%', '€90k', 'AWS + ferramentas cloud'],
                                    ['Customer Success', '10%', '€60k', 'Suporte + onboarding'],
                                    ['Operações', '5%', '€30k', 'Contabilidade + legal + escritório'],
                                    ['I&D', '5%', '€30k', 'Investigação + inovação']
                                ]}
                            />
                        )}
                    </div>
                </Section>

                {/* Footer */}
                <div style={{
                    marginTop: '64px',
                    paddingTop: '32px',
                    borderTop: `1px solid ${colors.border}`,
                    textAlign: 'center',
                    color: colors.textMuted,
                    fontSize: '14px'
                }}>
                    <p style={{ margin: 0 }}>
                        Documento gerado automaticamente pelo Mason Business Model Canvas Generator
                    </p>
                    <p style={{ margin: '8px 0 0 0' }}>
                        © 2025 {activeProject?.name || 'Mason'} - Todos os direitos reservados
                    </p>
                </div>
            </div>

            {/* Print & PDF Export Styles - Design Agent Knowledge */}
            <style>{`
                /* Print Styles - Only print document content */
                @media print {
                    /* Hide everything except document */
                    body * {
                        visibility: hidden;
                    }
                    
                    #business-model-document,
                    #business-model-document * {
                        visibility: visible;
                    }
                    
                    #business-model-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    
                    /* Hide UI elements */
                    .no-print {
                        display: none !important;
                    }
                    
                    /* White background for print */
                    body, #business-model-document {
                        background: white !important;
                    }
                    
                    /* Dark text for readability */
                    h1, h2, h3, h4, h5, h6, p, span, div, td, th, li {
                        color: #1f2937 !important;
                    }
                    
                    /* Borders and backgrounds */
                    div[style*="backgroundColor"] {
                        background-color: #f9fafb !important;
                        border: 1px solid #e5e7eb !important;
                    }
                    
                    /* Remove shadows */
                    * {
                        box-shadow: none !important;
                    }
                }
                
                /* PDF Export Styles - Applied via class */
                .pdf-export-mode {
                    background: white !important;
                }
                
                .pdf-export-mode h1,
                .pdf-export-mode h2,
                .pdf-export-mode h3,
                .pdf-export-mode h4,
                .pdf-export-mode p,
                .pdf-export-mode span,
                .pdf-export-mode div,
                .pdf-export-mode td,
                .pdf-export-mode th {
                    color: #1f2937 !important;
                }
                
                .pdf-export-mode div[style*="backgroundColor"] {
                    background-color: #f3f4f6 !important;
                    border: 1px solid #d1d5db !important;
                }
                
                .pdf-export-mode div[style*="borderLeft"] {
                    border-left-color: #2563eb !important;
                }
            `}</style>
        </div>
    );
};

export default BusinessModelDocument;
