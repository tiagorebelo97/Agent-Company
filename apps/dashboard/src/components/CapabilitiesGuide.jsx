import React from 'react';
import {
    MessageSquare,
    Zap,
    FileText,
    BarChart3,
    Layout,
    Code2,
    Info,
    ArrowRight
} from 'lucide-react';

const CapabilitiesGuide = () => {
    const colors = {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        warning: '#F59E0B',
        textMuted: '#9CA3AF',
        bg: '#000000',
        card: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)'
    };

    const capabilities = [
        {
            title: "Business Model Canvas (BMC)",
            icon: BarChart3,
            color: colors.primary,
            description: "Análise estratégica completa do modelo de negócio, incluindo projeções financeiras e parcerias.",
            prompt: "Gera um Business Model Canvas detalhado para o projeto [Nome].",
            location: "Separador 'Business Model'"
        },
        {
            title: "AI Analysis Multi-Agente",
            icon: Zap,
            color: colors.secondary,
            description: "Auditoria técnica profunda envolvendo 5 agentes especialistas (Arquitetura, Segurança, Performance, UX, Qualidade).",
            prompt: "Faz uma análise de IA completa para este projeto.",
            location: "Separador 'AI Analysis'"
        },
        {
            title: "Implementação de Funcionalidades",
            icon: Code2,
            color: colors.accent,
            description: "Decomposição e criação automática de código para novas features do seu projeto.",
            prompt: "Implementa um sistema de login com autenticação JWT.",
            location: "Painel 'Tasks' & 'Activity Feed'"
        },
        {
            title: "Design & Prototipagem",
            icon: Layout,
            color: colors.warning,
            description: "Sugestões de interface, paleta de cores e princípios de usabilidade.",
            prompt: "Sugere melhorias de UX para a página inicial.",
            location: "Separador 'Recommendations'"
        }
    ];

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', color: colors.primary,
                    fontSize: '14px', fontWeight: 700, marginBottom: '16px'
                }}>
                    <Info size={16} /> GUIA DE COMANDO
                </div>
                <h1 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                    O Que Podes Gerar Via Chat
                </h1>
                <p style={{ fontSize: '18px', color: colors.textMuted, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    As funcionalidades de inteligência artificial agora são disparadas através da nossa conversa.
                    Escolhe uma capacidade e utiliza os comandos sugeridos.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                {capabilities.map((cap, i) => (
                    <div key={i} style={{
                        padding: '32px', backgroundColor: colors.card, border: `1px solid ${colors.border}`,
                        borderRadius: '24px', transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
                            backgroundColor: cap.color, opacity: 0.03, borderRadius: '50%'
                        }} />

                        <div style={{ display: 'flex', gap: '24px', alignItems: 'start' }}>
                            <div style={{
                                padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                                color: cap.color
                            }}>
                                <cap.icon size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>{cap.title}</h3>
                                <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '24px', lineHeight: 1.5 }}>
                                    {cap.description}
                                </p>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: cap.color, textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Comando Sugerido:
                                    </div>
                                    <div style={{
                                        padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                                        fontFamily: 'monospace', fontSize: '14px', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        "{cap.prompt}"
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.textMuted }}>
                                    <ArrowRight size={14} /> Localização: <strong>{cap.location}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '64px', padding: '32px', backgroundColor: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '24px', textAlign: 'center'
            }}>
                <MessageSquare size={32} style={{ color: colors.secondary, marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Precisas de Algo Personalizado?</h3>
                <p style={{ color: colors.textMuted, fontSize: '15px' }}>
                    Basta descreveres o teu objetivo no chat. O Gemini e o enxame de agentes especialistas
                    trabalham em conjunto para encontrar a melhor solução.
                </p>
            </div>
        </div>
    );
};

export default CapabilitiesGuide;
