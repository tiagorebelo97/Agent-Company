import React, { useState, useEffect } from 'react';
import { Shield, Zap, Code, Users, BarChart, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import AnalysisProgressIndicator from './AnalysisProgressIndicator';

const ProjectAnalysisDashboard = ({ project, agents = [], isTaskInProgress = false }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [suggestedAgents, setSuggestedAgents] = useState([]);

    const showLoading = isAnalyzing || isTaskInProgress;

    useEffect(() => {
        if (project) {
            try {
                const results = typeof project.analysisResults === 'string' ? JSON.parse(project.analysisResults) : project.analysisResults || {};
                const suggested = typeof project.suggestedAgents === 'string' ? JSON.parse(project.suggestedAgents) : project.suggestedAgents || [];
                setAnalysisData(results);
                setSuggestedAgents(suggested);
            } catch (e) {
                console.error('Failed to parse analysis data:', e);
            }
        }
    }, [project]);

    const handleStartAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(`http://localhost:3001/api/projects/${project.id}/analyze`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                console.log('Analysis started:', data.taskId);
            }
        } catch (error) {
            console.error('Error starting analysis:', error);
        } finally {
            // Keep the loading state briefly if the background task is still starting
            setTimeout(() => setIsAnalyzing(false), 3000);
        }
    };

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        primary: '#2B81FF',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        success: '#10b981',
        warning: '#f59e0b'
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto' }}>
            {/* Analysis Action Card */}
            <div style={{
                padding: '32px',
                backgroundColor: 'rgba(43, 129, 255, 0.05)',
                border: `1px solid ${colors.primary}30`,
                borderRadius: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                        Repository Intelligence
                    </h2>
                    <p style={{ margin: 0, fontSize: '14px', color: colors.textMuted, maxWidth: '500px' }}>
                        Trigger the Project Manager to perform a comprehensive scan of your codebase.
                        It will identify technologies, architecture patterns, and suggest the best agents for this stack.
                    </p>
                </div>
                <button
                    onClick={handleStartAnalysis}
                    disabled={showLoading}
                    style={{
                        padding: '14px 28px',
                        backgroundColor: showLoading ? colors.card : colors.primary,
                        color: '#fff',
                        border: showLoading ? `1px solid ${colors.border}` : 'none',
                        borderRadius: '14px',
                        fontWeight: 700,
                        cursor: showLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                    }}
                >
                    {showLoading ? (
                        <>
                            <div className="animate-pulse" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.warning }}></div>
                            AI Scan in Progress...
                        </>
                    ) : (
                        <>
                            <Zap size={18} fill="#fff" />
                            Analyze Repository
                        </>
                    )}
                </button>
            </div>

            {/* Analysis Progress Indicator */}
            {project && <AnalysisProgressIndicator projectId={project.id} />}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                {/* Insights Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ padding: '24px', backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <BarChart size={20} color={colors.primary} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Codebase Insights</h3>
                        </div>

                        {analysisData && Object.keys(analysisData).length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                {[
                                    { label: 'Technology Stack', value: analysisData.stack || 'Undetected', icon: Code },
                                    { label: 'Complexity Score', value: analysisData.complexity || 'Calculating...', icon: Zap },
                                    { label: 'Test Coverage', value: analysisData.coverage || 'Not scanned', icon: CheckCircle },
                                    { label: 'Security Status', value: analysisData.security || 'Pending', icon: Shield }
                                ].map((stat, i) => (
                                    <div key={i} style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <stat.icon size={14} color={colors.textMuted} />
                                            <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</span>
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 700 }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                                No analysis data available. Click the button above to start.
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '24px', backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Terminal size={20} color={colors.warning} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Recommendations</h3>
                        </div>

                        {analysisData?.recommendations ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {analysisData.recommendations.map((rec, idx) => (
                                    <div key={idx} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${colors.warning}`, fontSize: '14px' }}>
                                        {rec}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: colors.textMuted, fontSize: '14px', fontStyle: 'italic' }}>
                                Await analysis for improvement suggestions...
                            </div>
                        )}
                    </div>
                </div>

                {/* Suggested Agents / Onboarding */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ padding: '24px', backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Users size={20} color={colors.success} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Suggested Swarm</h3>
                        </div>

                        {suggestedAgents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {suggestedAgents.map(agentId => {
                                    const agent = agents.find(a => a.id === agentId);
                                    if (!agent) return null;
                                    return (
                                        <div key={agentId} style={{
                                            padding: '12px',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ fontSize: '20px' }}>{agent.emoji || '🤖'}</div>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{agent.name}</div>
                                                    <div style={{ fontSize: '11px', color: colors.textMuted }}>{agent.role}</div>
                                                </div>
                                            </div>
                                            <button style={{
                                                padding: '6px 12px',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                color: colors.success,
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                cursor: 'pointer'
                                            }}>
                                                ONBOARD
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <AlertTriangle size={24} color={colors.textMuted} style={{ marginBottom: '12px' }} />
                                <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                                    No agents suggested yet. <br />PM must analyze code first.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalysisDashboard;
