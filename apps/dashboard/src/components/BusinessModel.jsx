import React, { useState, useEffect } from 'react';
import {
    Building2,
    Target,
    Truck,
    Heart,
    Coins,
    Key,
    Activity,
    Users2,
    Wallet,
    Sparkles,
    Info,
    ChevronDown,
    Loader2,
    AlertCircle
} from 'lucide-react';

const BusinessModel = ({ projects = [], refreshProjects, onGenerate }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [canvasData, setCanvasData] = useState(null);

    useEffect(() => {
        console.log('BusinessModel mounted via ProjectWorkspace', { projects, selectedProjectId });
    }, []);

    const colors = {
        primary: '#ec4899',
        secondary: '#8b5cf6',
        accent: '#2B81FF',
        bg: '#000000',
        card: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        hover: 'rgba(255, 255, 255, 0.06)',
        textMuted: '#8A8A8A'
    };

    const emptyCanvas = {
        keyPartners: { title: "Parceiros-Chave", icon: Users2, color: '#F472B6', content: [] },
        keyActivities: { title: "Atividades-Chave", icon: Activity, color: '#FB7185', content: [] },
        keyResources: { title: "Recursos-Chave", icon: Key, color: '#FDA4AF', content: [] },
        valuePropositions: { title: "Propostas de Valor", icon: Sparkles, color: '#8B5CF6', content: [] },
        customerRelationships: { title: "Relações com Clientes", icon: Heart, color: '#C084FC', content: [] },
        channels: { title: "Canais", icon: Truck, color: '#E879F9', content: [] },
        customerSegments: { title: "Segmentos de Clientes", icon: Target, color: '#2B81FF', content: [] },
        costStructure: { title: "Estrutura de Custos", icon: Wallet, color: '#94A3B8', content: [] },
        revenueStreams: { title: "Fontes de Receita", icon: Coins, color: '#6366F1', content: [] }
    };

    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects]);

    useEffect(() => {
        const project = projects.find(p => p.id === selectedProjectId);
        console.log('BusinessModel useEffect:', { selectedProjectId, project: project?.name, hasBusinessModel: !!project?.businessModel });
        if (project && project.businessModel && project.businessModel !== '{}') {
            try {
                const data = typeof project.businessModel === 'string' ? JSON.parse(project.businessModel) : project.businessModel;
                console.log('Parsed businessModel data:', Object.keys(data));

                // Map API keys to component keys if they differ
                const mappedData = {
                    keyPartners: data.key_partners || data.keyPartners || emptyCanvas.keyPartners,
                    keyActivities: data.key_activities || data.keyActivities || emptyCanvas.keyActivities,
                    keyResources: data.key_resources || data.keyResources || emptyCanvas.keyResources,
                    valuePropositions: data.value_propositions || data.valuePropositions || emptyCanvas.valuePropositions,
                    customerRelationships: data.customer_relationships || data.customerRelationships || emptyCanvas.customerRelationships,
                    channels: data.channels || emptyCanvas.channels,
                    customerSegments: data.customer_segments || data.customerSegments || emptyCanvas.customerSegments,
                    costStructure: data.cost_structure || data.costStructure || emptyCanvas.costStructure,
                    revenueStreams: data.revenue_streams || data.revenueStreams || emptyCanvas.revenueStreams,
                    metadata: data.metadata || {}
                };

                // Ensure content is an array and titles are set
                Object.keys(emptyCanvas).forEach(key => {
                    if (!mappedData[key].content) mappedData[key].content = [];
                    if (!mappedData[key].title) mappedData[key].title = emptyCanvas[key].title;
                    if (!mappedData[key].icon) mappedData[key].icon = emptyCanvas[key].icon;
                    if (!mappedData[key].color) mappedData[key].color = emptyCanvas[key].color;

                    // Convert content to array if it's a string
                    if (typeof mappedData[key].content === 'string') {
                        mappedData[key].content = mappedData[key].content.split('\n').filter(s => s.trim());
                    }
                });

                setCanvasData(mappedData);
            } catch (e) {
                console.error("Failed to parse business model", e);
                setCanvasData(null);
            }
        } else {
            setCanvasData(null);
        }
    }, [selectedProjectId, projects]);

    const activeProject = projects.find(p => p.id === selectedProjectId);

    const Block = ({ id, data, className = "" }) => {
        const Icon = data.icon || emptyCanvas[id].icon;
        const color = data.color || emptyCanvas[id].color;
        const isActive = selectedBlock === id;

        return (
            <div
                onClick={() => setSelectedBlock(isActive ? null : id)}
                style={{
                    backgroundColor: colors.card,
                    border: `1px solid ${isActive ? color : colors.border}`,
                    borderRadius: '24px',
                    padding: '24px',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: isActive ? `0 0 30px ${color}20` : 'none',
                    backdropFilter: 'blur(10px)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    minHeight: '180px'
                }}
                className={`group ${className}`}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color
                    }}>
                        <Icon size={24} />
                    </div>
                    {data.content && data.content.length > 0 && (
                        <Info size={16} style={{ color: colors.textMuted, opacity: 0.5 }} />
                    )}
                </div>

                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: 800,
                        color: 'white',
                        letterSpacing: '-0.01em'
                    }}>
                        {data.title || emptyCanvas[id].title}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.content && data.content.length > 0 ? (
                        data.content.map((item, i) => (
                            <div key={i} style={{
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    marginTop: '7px',
                                    flexShrink: 0
                                }} />
                                {typeof item === 'object' ? item.text || JSON.stringify(item) : item}
                            </div>
                        ))
                    ) : (
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                            A aguardar definição...
                        </div>
                    )}
                </div>

                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
                    pointerEvents: 'none'
                }} />
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header with Project Selector */}
            <div style={{
                marginBottom: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                flexWrap: 'wrap',
                gap: '24px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: `linear-gradient(90deg, ${colors.primary}20, ${colors.secondary}20)`,
                            border: `1px solid ${colors.primary}40`,
                            fontSize: '11px',
                            fontWeight: 700,
                            color: colors.primary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Planeamento Estratégico
                        </div>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '42px', fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>
                        Modelo de Negócio
                    </h1>
                    <p style={{ color: colors.textMuted, marginTop: '8px', maxWidth: '500px', fontSize: '15px', lineHeight: 1.5 }}>
                        Definição visual de como o projeto gera, entrega e captura valor.
                    </p>
                </div>

                {projects.length > 1 && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    backgroundColor: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    color: 'white',
                                    padding: '12px 48px 12px 20px',
                                    borderRadius: '16px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    minWidth: '240px'
                                }}
                            >
                                <option value="" disabled>Selecionar Projeto...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown
                                size={18}
                                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: colors.textMuted }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {canvasData ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gridTemplateRows: 'repeat(3, auto)',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <Block id="keyPartners" data={canvasData.keyPartners} className="row-span-2 col-span-1" />
                    <Block id="keyActivities" data={canvasData.keyActivities} className="col-span-1" />
                    <Block id="valuePropositions" data={canvasData.valuePropositions} className="row-span-2 col-span-1" />
                    <Block id="customerRelationships" data={canvasData.customerRelationships} className="col-span-1" />
                    <Block id="customerSegments" data={canvasData.customerSegments} className="row-span-2 col-span-1" />
                    <Block id="keyResources" data={canvasData.keyResources} className="col-span-1" />
                    <Block id="channels" data={canvasData.channels} className="col-span-1" />
                    <Block id="costStructure" data={canvasData.costStructure} className="col-span-2" />
                    <Block id="revenueStreams" data={canvasData.revenueStreams} className="col-span-3" />
                </div>
            ) : (
                <div style={{
                    backgroundColor: colors.card,
                    borderRadius: '32px',
                    border: `1px dashed ${colors.border}`,
                    padding: '100px 40px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.textMuted
                    }}>
                        <AlertCircle size={40} />
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 800 }}>Sem Modelo de Negócio</h2>
                        <p style={{ margin: 0, color: colors.textMuted, maxWidth: '400px', lineHeight: 1.6 }}>
                            Ainda não foi gerado um modelo de negócio para este projeto.
                            Solicite à <strong>Strategy Agent</strong> para criar um Canvas completo.
                        </p>
                    </div>
                    <button
                        onClick={() => onGenerate(selectedProjectId)}
                        style={{
                            padding: '14px 28px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Sparkles size={20} />
                        Gerar com Strategy Agent
                    </button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .row-span-2 { grid-row: span 2; }
                .col-span-2 { grid-column: span 2; }
                .col-span-3 { grid-column: span 3; }
                select:hover { border-color: rgba(255,255,255,0.2) !important; }
                button:hover { transform: translateY(-2px); filter: brightness(1.1); }
            `}} />
        </div>
    );
};

export default BusinessModel;
