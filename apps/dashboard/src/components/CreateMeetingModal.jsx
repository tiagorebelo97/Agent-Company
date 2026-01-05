import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';

const CreateMeetingModal = ({ projectId, agents = [], onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || selectedAgents.length === 0) {
            return;
        }

        try {
            setCreating(true);
            const response = await fetch('http://localhost:3001/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    projectId,
                    agentIds: selectedAgents,
                    createdBy: 'user'
                })
            });
            const data = await response.json();
            if (data.success) {
                if (onCreated) onCreated(data.meeting);
                onClose();
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
        } finally {
            setCreating(false);
        }
    };

    const toggleAgent = (agentId) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    const colors = {
        bg: '#0a0a0a',
        card: '#1e1e1e',
        border: 'rgba(255,255,255,0.1)',
        primary: '#2B81FF',
        textMain: '#ffffff',
        textMuted: '#8A8A8A'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: colors.card,
                borderRadius: '16px',
                border: `1px solid ${colors.border}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={24} color={colors.primary} />
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Create Meeting</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.textMuted,
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>
                            Meeting Title *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Sprint Planning"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '13px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>
                            Description (optional)
                        </label>
                        <textarea
                            placeholder="What will be discussed?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '13px',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>
                            Invite Agents * ({selectedAgents.length} selected)
                        </label>
                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            border: `1px solid ${colors.border}`
                        }}>
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    onClick={() => toggleAgent(agent.id)}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: selectedAgents.includes(agent.id) ? `${colors.primary}20` : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${selectedAgents.includes(agent.id) ? colors.primary + '50' : colors.border}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '4px',
                                        border: `2px solid ${selectedAgents.includes(agent.id) ? colors.primary : colors.border}`,
                                        backgroundColor: selectedAgents.includes(agent.id) ? colors.primary : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px'
                                    }}>
                                        {selectedAgents.includes(agent.id) && '✓'}
                                    </div>
                                    <div style={{ fontSize: '18px' }}>{agent.emoji || '🤖'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{agent.name}</div>
                                        <div style={{ fontSize: '11px', color: colors.textMuted }}>{agent.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: `1px solid ${colors.border}` }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: colors.textMuted,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={creating || !title.trim() || selectedAgents.length === 0}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: creating || !title.trim() || selectedAgents.length === 0 ? 'rgba(255,255,255,0.05)' : colors.primary,
                            color: creating || !title.trim() || selectedAgents.length === 0 ? colors.textMuted : '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: creating || !title.trim() || selectedAgents.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={16} />
                        {creating ? 'Creating...' : 'Create Meeting'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateMeetingModal;
