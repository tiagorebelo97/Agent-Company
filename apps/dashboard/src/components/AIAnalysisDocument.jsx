import React, { useState, useEffect, useRef } from 'react';
import {
    Shield,
    Zap,
    Layout,
    Code,
    Trophy,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Printer,
    Download,
    FileSearch,
    Brain,
    Layers,
    Activity
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

const AIAnalysisDocument = ({ projects = [], activeProjectId, onRunAnalysis }) => {
    const [analysisData, setAnalysisData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const documentRef = useRef(null);

    const colors = {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        bg: '#000000',
        card: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        textMuted: '#9CA3AF'
    };

    const activeProject = projects.find(p => p.id === activeProjectId);

    useEffect(() => {
        if (activeProject && activeProject.aiAnalysis) {
            try {
                const data = typeof activeProject.aiAnalysis === 'string'
                    ? JSON.parse(activeProject.aiAnalysis)
                    : activeProject.aiAnalysis;
                setAnalysisData(data && Object.keys(data).length > 0 ? data : null);
            } catch (e) {
                console.error("Failed to parse AI analysis", e);
                setAnalysisData(null);
            }
        } else {
            setAnalysisData(null);
        }
    }, [activeProject]);

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        try {
            await onRunAnalysis(activeProjectId);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        const element = documentRef.current;
        element.classList.add('pdf-export-mode');

        const opt = {
            margin: [10, 10],
            filename: `${activeProject?.name || 'Project'}_AI_Analysis.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.classList.remove('pdf-export-mode');
        });
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '24px' }}>
                <div style={{
                    width: '64px', height: '64px', border: '4px solid rgba(59, 130, 246, 0.1)',
                    borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'white' }}>Executando Análise Multi-Agent...</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: colors.textMuted }}>Colaborando com Gemini AI + Agentes Especialistas</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (activeProjectId === 'all' || !activeProject) {
        return (
            <div style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: colors.bg }}>
                <div style={{
                    width: '80px', height: '80px', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Brain size={40} style={{ color: colors.primary }} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>AI Analysis Workspace</h2>
                <p style={{ fontSize: '16px', color: colors.textMuted, maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                    Selecione um projeto específico no menu lateral para realizar uma auditoria completa.
                </p>
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: colors.bg }}>
                <div style={{
                    width: '80px', height: '80px', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Brain size={40} style={{ color: colors.primary }} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>Consultoria Multi-Agente</h2>
                <p style={{ fontSize: '16px', color: colors.textMuted, maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                    A análise de IA agora é realizada de forma colaborativa através do **Chat de Comando**.
                    <br /><br />
                    Para analisar o projeto **{activeProject.name}**, peça ao Gemini no chat:
                    <br />
                    *"Faz uma análise de IA completa para este projeto"*
                </p>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: `1px solid ${colors.border}`,
                    color: colors.textMuted, fontSize: '14px'
                }}>
                    <AlertTriangle size={16} /> Disparos diretos via App desativados por agora
                </div>
            </div>
        );
    }

    const Section = ({ title, icon: Icon, color, children }) => (
        <div style={{ marginBottom: '48px', pageBreakInside: 'avoid' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
                paddingBottom: '16px', borderBottom: `2px solid ${color || colors.primary}`
            }}>
                {Icon && <Icon size={28} style={{ color: color || colors.primary }} />}
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{title}</h2>
            </div>
            {children}
        </div>
    );

    const MetricCard = ({ label, value, subtext, icon: Icon, color }) => (
        <div style={{
            padding: '24px', backgroundColor: colors.card, border: `1px solid ${colors.border}`,
            borderRadius: '16px', borderLeft: `4px solid ${color}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: colors.textMuted, fontWeight: 600 }}>{label}</div>
                {Icon && <Icon size={20} style={{ color: color, opacity: 0.8 }} />}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '13px', color: colors.textMuted }}>{subtext}</div>
        </div>
    );

    const ScoreCircle = ({ score, label }) => {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        let color = colors.danger;
        if (score >= 80) color = colors.accent;
        else if (score >= 60) color = colors.warning;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle
                            cx="60" cy="60" r={radius} fill="transparent" stroke={color} strokeWidth="10"
                            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            transform="rotate(-90 60 60)"
                        />
                        <text x="60" y="65" fontSize="24" fontWeight="900" fill="white" textAnchor="middle">{score}%</text>
                    </svg>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px', backgroundColor: colors.bg, minHeight: '100vh' }}>
            <div ref={documentRef} id="ai-analysis-document">
                {/* Header */}
                <div style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: `3px solid ${colors.primary}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
                        <div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)', border: `1px solid ${colors.primary}`,
                                borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: colors.primary, marginBottom: '16px'
                            }}>
                                <Brain size={14} /> MULTI-AGENT AI ANALYSIS
                            </div>
                            <h1 style={{ margin: '0 0 12px 0', fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
                                {activeProject?.name || 'Project'}
                            </h1>
                            <p style={{ margin: 0, fontSize: '18px', color: colors.textMuted, lineHeight: 1.6 }}>
                                {analysisData.metadata.description || 'Relatório detalhado de saúde estratégica, arquitetura, segurança e UX.'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
                            {/* Re-analisar button hidden to favor chat collaboration */}
                            <button onClick={handlePrint} style={{
                                padding: '12px 20px', backgroundColor: 'transparent', border: `1px solid ${colors.border}`,
                                borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                gap: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'
                            }}>
                                <Printer size={18} /> Print
                            </button>
                            <button onClick={handleExportPDF} style={{
                                padding: '12px 20px', backgroundColor: colors.primary, border: 'none',
                                borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                gap: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'
                            }}>
                                <Download size={18} /> Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Agent Collaboration Section */}
                    <div style={{
                        padding: '24px', backgroundColor: 'rgba(139, 92, 246, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', marginBottom: '32px'
                    }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: colors.secondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Brain size={20} /> PARCERIA MULTI-AGENT + GEMINI AI
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                            {analysisData.metadata.agents_used.map((agent, i) => (
                                <div key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <strong style={{ color: colors.secondary }}>{agent.agent}:</strong> {agent.contribution}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginTop: '40px' }}>
                        <ScoreCircle score={analysisData.executive_summary.overall_score} label="Overall Score" />
                        <ScoreCircle score={analysisData.code_quality.score} label="Code Quality" />
                        <ScoreCircle score={analysisData.architecture.score} label="Architecture" />
                        <ScoreCircle score={analysisData.security.score} label="Security" />
                        <ScoreCircle score={analysisData.ux_design.score} label="UX / Design" />
                    </div>
                </div>

                {/* Executive Summary */}
                <Section title="Sumário Executivo" icon={FileSearch} color={colors.primary}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px'
                    }}>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.card, borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>STATUS</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: colors.accent }}>{analysisData.executive_summary.health_status.toUpperCase()}</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.card, borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>CRITICAL ISSUES</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: colors.danger }}>{analysisData.executive_summary.critical_issues}</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.card, borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>WARNINGS</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: colors.warning }}>{analysisData.executive_summary.warnings}</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.card, borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>VERSION</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{analysisData.metadata.version}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysisData.executive_summary.key_findings.map((finding, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: '16px', padding: '20px', backgroundColor: colors.card,
                                borderRadius: '12px', alignItems: 'center'
                            }}>
                                <CheckCircle size={20} style={{ color: colors.primary, opacity: 0.6 }} />
                                <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{finding}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Code Quality */}
                <Section title="Qualidade de Código" icon={Code} color={colors.secondary}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <MetricCard label="TOTAL FILES" value={analysisData.code_quality.metrics.total_files} subtext={analysisData.code_quality.metrics.files_subtext || "Arquivos monitorados"} color={colors.secondary} icon={Code} />
                        <MetricCard label="COMPLEXITY" value={analysisData.code_quality.metrics.complexity_index} subtext={analysisData.code_quality.metrics.complexity_subtext || "Média por módulo"} color={colors.secondary} />
                        <MetricCard label="ESLINT COMPLIANCE" value={analysisData.code_quality.metrics.eslint_compliance} subtext={analysisData.code_quality.metrics.compliance_subtext || "Conformidade com padrões"} color={colors.accent} />
                        <MetricCard label="DUPLICATION" value={analysisData.code_quality.metrics.duplication_ratio} subtext={analysisData.code_quality.metrics.duplication_subtext || "Alvo: < 5%"} color={colors.warning} />
                    </div>
                    <div style={{ fontSize: '15px', color: colors.textMuted, lineHeight: 1.7, padding: '20px', backgroundColor: colors.card, borderRadius: '12px' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {analysisData.code_quality.findings.map((f, i) => <li key={i} style={{ marginBottom: '8px' }}>{f}</li>)}
                        </ul>
                    </div>
                </Section>

                {/* Architecture */}
                <Section title="Arquitetura & Design" icon={Layers} color={colors.primary}>
                    <div style={{ padding: '24px', backgroundColor: colors.card, borderRadius: '16px', borderLeft: `4px solid ${colors.primary}`, marginBottom: '32px' }}>
                        <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>PATTERN</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>{analysisData.architecture.pattern}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.accent, marginBottom: '12px' }}>FORÇAS</div>
                                {analysisData.architecture.strengths.map((s, i) => <div key={i} style={{ fontSize: '14px', color: 'white', marginBottom: '6px' }}>• {s}</div>)}
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: colors.danger, marginBottom: '12px' }}>PONTOS DE MELHORIA</div>
                                {analysisData.architecture.weaknesses.map((w, i) => <div key={i} style={{ fontSize: '14px', color: 'white', marginBottom: '6px' }}>• {w}</div>)}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Security */}
                <Section title="Segurança & Compliance" icon={Shield} color={colors.danger}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {Object.entries(analysisData.security.vulnerabilities).map(([key, count]) => (
                            <div key={key} style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>{key}</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: key === 'critical' ? colors.danger : key === 'high' ? colors.warning : 'white' }}>{count}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysisData.security.findings.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.9)' }}>
                                <AlertTriangle size={18} style={{ color: colors.danger }} />
                                <div style={{ fontSize: '14px' }}>{f}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Performance */}
                <Section title="Performance & Escalabilidade" icon={Activity} color={colors.accent}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                        <div style={{ padding: '24px', backgroundColor: colors.card, borderRadius: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: colors.accent, marginBottom: '20px' }}>FRONTEND</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>Bundle Size</span>
                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{analysisData.performance.frontend.bundle_size}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>Load Time</span>
                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{analysisData.performance.frontend.load_time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>Lighthouse</span>
                                    <span style={{ color: colors.accent, fontWeight: 700, fontSize: '13px' }}>{analysisData.performance.frontend.lighthouse_score}/100</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: colors.card, borderRadius: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: colors.accent, marginBottom: '20px' }}>BACKEND</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>Avg Response</span>
                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{analysisData.performance.backend.avg_response_time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>DB Efficiency</span>
                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{analysisData.performance.backend.db_query_efficiency}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* UI/UX */}
                <Section title="UI/UX & Design" icon={Layout} color={colors.accent}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>ACCESSIBILITY</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: colors.warning }}>{analysisData.ux_design.accessibility_score}%</div>
                        </div>
                        <div style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>RESPONSIVE</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: colors.accent }}>{analysisData.ux_design.responsive_score}%</div>
                        </div>
                        <div style={{ padding: '20px', backgroundColor: colors.card, borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>CONSISTENCY</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: colors.accent }}>{analysisData.ux_design.score}%</div>
                        </div>
                    </div>
                </Section>

                {/* Action Plan */}
                <Section title="Plano de Ação Sugerido" icon={TrendingUp} color={colors.primary}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: colors.danger, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} /> PRIORIDADE ALTA
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {analysisData.action_plan.high_priority.map((p, i) => (
                                    <div key={i} style={{ padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{p.title}</div>
                                        <div style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.5 }}>{p.description}</div>
                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 700, color: colors.danger, textTransform: 'uppercase' }}>IMPACT: {p.impact}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* More priorities could be added here */}
                        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: colors.card, borderRadius: '12px', textAlign: 'center', fontSize: '14px', color: colors.textMuted }}>
                            Gerado em {new Date(analysisData.metadata.analyzed_at).toLocaleDateString()} pelo {analysisData.metadata.orchestrator || 'Gemini AI Multitask Orchestrator'}.
                        </div>
                    </div>
                </Section>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    #ai-analysis-document, #ai-analysis-document * {
                        visibility: visible;
                        color: #1f2937 !important;
                    }
                    #ai-analysis-document { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
                    div[style*="backgroundColor"] { background-color: #f9fafb !important; border: 1px solid #e5e7eb !important; }
                }
                .pdf-export-mode { background: white !important; }
                .pdf-export-mode h1, .pdf-export-mode h2, .pdf-export-mode h3, .pdf-export-mode h4, 
                .pdf-export-mode p, .pdf-export-mode span, .pdf-export-mode div, .pdf-export-mode td, .pdf-export-mode li {
                    color: #1f2937 !important;
                }
                .pdf-export-mode div[style*="backgroundColor"] { background-color: #f3f4f6 !important; border: 1px solid #d1d5db !important; }
            `}</style>
        </div>
    );
};

export default AIAnalysisDocument;
