import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, XCircle, Play, AlertTriangle, Filter, ChevronDown } from 'lucide-react';

const RecommendationsList = ({ projectId, agents = [] }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, implemented, dismissed
    const [message, setMessage] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchRecommendations();
            fetchTasks();
        }
    }, [projectId, filter]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/tasks`);
            const data = await response.json();
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== 'all' ? `?status=${filter}` : '';
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/recommendations${statusParam}`);
            const data = await response.json();
            if (data.success) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleImplement = async (recommendationId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/recommendations/${recommendationId}/implement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentIds: ['pm'] })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: `Task created successfully!` });
                fetchRecommendations();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            console.error('Error implementing recommendation:', error);
            setMessage({ type: 'error', text: 'Failed to implement recommendation' });
        }
    };

    const handleDismiss = async (recommendationId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/recommendations/${recommendationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'dismissed' })
            });
            const data = await response.json();
            if (data.success) {
                fetchRecommendations();
            }
        } catch (error) {
            console.error('Error dismissing recommendation:', error);
        }
    };

    const handleArchive = async (recommendationId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/recommendations/${recommendationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' })
            });
            const data = await response.json();
            if (data.success) {
                fetchRecommendations();
            }
        } catch (error) {
            console.error('Error archiving recommendation:', error);
        }
    };

    const colors = {
        bg: '#0a0a0a',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        primary: '#2B81FF',
        success: '#10b981',
        error: '#dc2626',
        warning: '#f59e0b',
        textMain: '#ffffff',
        textMuted: '#8A8A8A'
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return colors.error;
            case 'medium': return colors.warning;
            case 'low': return colors.primary;
            default: return colors.textMuted;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'implemented': return <CheckCircle size={16} color={colors.success} />;
            case 'dismissed': return <XCircle size={16} color={colors.textMuted} />;
            default: return <AlertTriangle size={16} color={colors.warning} />;
        }
    };

    return (
        <div style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Lightbulb size={20} color={colors.warning} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Recommendations</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Filter size={14} color={colors.textMuted} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            color: colors.textMain,
                            fontSize: '12px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="implemented">Implemented</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    border: `1px solid ${message.type === 'success' ? colors.success : colors.error}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: message.type === 'success' ? colors.success : colors.error
                }}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                        Loading recommendations...
                    </div>
                ) : recommendations.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Lightbulb size={32} color={colors.textMuted} style={{ marginBottom: '12px' }} />
                        <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                            No recommendations {filter !== 'all' ? `with status "${filter}"` : 'available'}.
                        </div>
                    </div>
                ) : (
                    recommendations.map((rec) => {
                        let metadata = {};
                        try {
                            metadata = typeof rec.metadata === 'string' ? JSON.parse(rec.metadata) : (rec.metadata || {});
                        } catch (e) {
                            console.error('Error parsing metadata', e);
                        }

                        const isExpanded = expandedId === rec.id;

                        return (
                            <div
                                key={rec.id}
                                style={{
                                    padding: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${colors.border}`,
                                    borderLeft: `4px solid ${getPriorityColor(rec.priority)}`,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                                    onClick={() => handleToggleExpand(rec.id)}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            {getStatusIcon(rec.status)}
                                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>
                                                {rec.title}
                                            </h4>
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            color: colors.textMuted,
                                            lineHeight: '1.5'
                                        }}>
                                            {rec.description}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: `${getPriorityColor(rec.priority)}20`,
                                                color: getPriorityColor(rec.priority),
                                                borderRadius: '6px',
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase'
                                            }}>
                                                {rec.priority}
                                            </span>
                                            {rec.category && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    color: colors.textMuted,
                                                    borderRadius: '6px',
                                                    fontSize: '10px',
                                                    fontWeight: 700
                                                }}>
                                                    {rec.category}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            color: colors.textMuted,
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s'
                                        }}>
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        borderRadius: '8px',
                                        border: `1px solid rgba(255,255,255,0.05)`,
                                        marginTop: '4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 800, color: colors.primary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Detailed Explanation
                                            </div>
                                            <p style={{ margin: 0, fontSize: '13px', color: colors.textMain, lineHeight: '1.6' }}>
                                                {metadata.detailedExplanation || "No detailed explanation available."}
                                            </p>
                                        </div>

                                        {metadata.implementationPlan && metadata.implementationPlan.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 800, color: colors.success, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Implementation Plan
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {metadata.implementationPlan.map((step, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                backgroundColor: `${colors.success}20`,
                                                                color: colors.success,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '10px',
                                                                fontWeight: 800,
                                                                flexShrink: 0,
                                                                marginTop: '2px'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: colors.textMain, lineHeight: '1.5' }}>
                                                                {step}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {rec.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${colors.border}` }}>
                                        <button
                                            onClick={() => handleImplement(rec.id)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 16px',
                                                backgroundColor: `${colors.primary}20`,
                                                color: colors.primary,
                                                border: `1px solid ${colors.primary}50`,
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Play size={14} />
                                            Implement
                                        </button>
                                        <button
                                            onClick={() => handleArchive(rec.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                color: colors.textMuted,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Archive
                                        </button>
                                        <button
                                            onClick={() => handleDismiss(rec.id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                color: colors.textMuted,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}

                                {rec.status === 'implemented' && rec.implementedAt && (
                                    <div style={{
                                        fontSize: '11px',
                                        color: colors.textMuted,
                                        paddingTop: '8px',
                                        borderTop: `1px solid ${colors.border}`
                                    }}>
                                        <div>Implemented on {new Date(rec.implementedAt).toLocaleDateString()}</div>
                                        {rec.taskId && (() => {
                                            const task = tasks.find(t => t.id === rec.taskId);
                                            if (task) {
                                                return (
                                                    <div style={{
                                                        marginTop: '6px',
                                                        padding: '6px 10px',
                                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span>📋 {task.title}</span>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            backgroundColor: task.status === 'done' ? colors.success + '30' :
                                                                task.status === 'in_progress' ? colors.primary + '30' :
                                                                    'rgba(255,255,255,0.1)',
                                                            color: task.status === 'done' ? colors.success :
                                                                task.status === 'in_progress' ? colors.primary :
                                                                    colors.textMuted,
                                                            borderRadius: '6px',
                                                            fontSize: '10px',
                                                            fontWeight: 700
                                                        }}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecommendationsList;
