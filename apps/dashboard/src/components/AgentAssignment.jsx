import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CheckCircle, UserPlus, Shield, AlertCircle } from 'lucide-react';

const AgentAssignment = ({ projectId, agents = [], onUpdate }) => {
    const [project, setProject] = useState(null);
    const [assignedAgents, setAssignedAgents] = useState([]);
    const [suggestedAgents, setSuggestedAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}`);
            const data = await response.json();
            if (data.success) {
                setProject(data.project);
                
                // Parse assigned agents
                try {
                    const assigned = JSON.parse(data.project.assignedAgents || '[]');
                    setAssignedAgents(assigned);
                } catch (e) {
                    setAssignedAgents([]);
                }
                
                // Parse suggested agents
                try {
                    const suggested = JSON.parse(data.project.suggestedAgents || '[]');
                    setSuggestedAgents(suggested);
                } catch (e) {
                    setSuggestedAgents([]);
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            setMessage({ type: 'error', text: 'Failed to fetch project data' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignAgent = (agentId) => {
        if (!assignedAgents.includes(agentId)) {
            const newAssigned = [...assignedAgents, agentId];
            setAssignedAgents(newAssigned);
            saveAssignments(newAssigned);
        }
    };

    const handleUnassignAgent = (agentId) => {
        const newAssigned = assignedAgents.filter(id => id !== agentId);
        setAssignedAgents(newAssigned);
        saveAssignments(newAssigned);
    };

    const handleAssignAllSuggested = () => {
        const newAssigned = [...new Set([...assignedAgents, ...suggestedAgents])];
        setAssignedAgents(newAssigned);
        saveAssignments(newAssigned);
    };

    const saveAssignments = async (agentIds) => {
        try {
            setSaving(true);
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignedAgents: JSON.stringify(agentIds)
                })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Agent assignments updated successfully' });
                if (onUpdate) onUpdate();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update assignments' });
            }
        } catch (error) {
            console.error('Error saving assignments:', error);
            setMessage({ type: 'error', text: 'Failed to save assignments' });
        } finally {
            setSaving(false);
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

    const getAgentById = (agentId) => {
        return agents.find(a => a.id === agentId) || { id: agentId, name: agentId, emoji: '🤖' };
    };

    const availableAgents = agents.filter(a => !assignedAgents.includes(a.id));
    const assignedAgentObjects = assignedAgents.map(getAgentById);
    const suggestedButNotAssigned = suggestedAgents.filter(id => !assignedAgents.includes(id));

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                Loading project data...
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>Agent Team Assignment</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: colors.textMuted }}>
                        Assign specialized agents to work on this project
                    </p>
                </div>
                {saving && (
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: colors.textMuted
                    }}>
                        Saving...
                    </div>
                )}
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
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* AI Suggested Agents */}
            {suggestedButNotAssigned.length > 0 && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(43, 129, 255, 0.05)',
                    border: `1px solid ${colors.primary}30`,
                    borderRadius: '16px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} color={colors.primary} />
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>AI Suggested Agents</h3>
                        </div>
                        <button
                            onClick={handleAssignAllSuggested}
                            disabled={saving}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: colors.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <UserPlus size={12} />
                            Assign All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {suggestedButNotAssigned.map(agentId => {
                            const agent = getAgentById(agentId);
                            return (
                                <button
                                    key={agentId}
                                    onClick={() => handleAssignAgent(agentId)}
                                    disabled={saving}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.primary}50`,
                                        borderRadius: '8px',
                                        color: colors.textMain,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(43, 129, 255, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                >
                                    <span style={{ fontSize: '16px' }}>{agent.emoji || '🤖'}</span>
                                    <span style={{ fontWeight: 600 }}>{agent.name}</span>
                                    <Plus size={14} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Assigned Agents */}
            <div style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Users size={20} color={colors.success} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                        Assigned Team ({assignedAgents.length})
                    </h3>
                </div>

                {assignedAgentObjects.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: colors.textMuted
                    }}>
                        <Users size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <div style={{ fontSize: '13px' }}>No agents assigned yet</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Select agents from the available pool below</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {assignedAgentObjects.map((agent) => (
                            <div
                                key={agent.id}
                                style={{
                                    padding: '16px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    border: `1px solid ${colors.success}50`,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '24px', flexShrink: 0 }}>{agent.emoji || '🤖'}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {agent.name}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: colors.textMuted,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {agent.role || 'Agent'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUnassignAgent(agent.id)}
                                    disabled={saving}
                                    style={{
                                        padding: '6px',
                                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                        border: `1px solid ${colors.error}30`,
                                        borderRadius: '6px',
                                        color: colors.error,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0
                                    }}
                                    title="Remove from team"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Agents */}
            <div style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Users size={20} color={colors.primary} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                        Available Agents ({availableAgents.length})
                    </h3>
                </div>

                {availableAgents.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: colors.textMuted
                    }}>
                        <CheckCircle size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <div style={{ fontSize: '13px' }}>All agents are assigned to this project</div>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        {availableAgents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => handleAssignAgent(agent.id)}
                                style={{
                                    padding: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!saving) {
                                        e.currentTarget.style.backgroundColor = 'rgba(43, 129, 255, 0.1)';
                                        e.currentTarget.style.borderColor = colors.primary + '50';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = colors.border;
                                }}
                            >
                                <div style={{ fontSize: '24px' }}>{agent.emoji || '🤖'}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {agent.name}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: colors.textMuted,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {agent.role || 'Agent'}
                                    </div>
                                </div>
                                <Plus size={16} color={colors.primary} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
            }}>
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${colors.success}30`,
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: colors.success }}>
                        {assignedAgents.length}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px', fontWeight: 600 }}>
                        ASSIGNED
                    </div>
                </div>
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(43, 129, 255, 0.1)',
                    border: `1px solid ${colors.primary}30`,
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: colors.primary }}>
                        {availableAgents.length}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px', fontWeight: 600 }}>
                        AVAILABLE
                    </div>
                </div>
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${colors.warning}30`,
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: colors.warning }}>
                        {suggestedAgents.length}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px', fontWeight: 600 }}>
                        SUGGESTED
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentAssignment;
