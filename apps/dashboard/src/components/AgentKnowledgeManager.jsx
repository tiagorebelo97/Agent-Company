import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, Video, Link as LinkIcon, BookOpen, X, Check } from 'lucide-react';

const AgentKnowledgeManager = ({ agentId, agentName, onClose }) => {
    const [knowledge, setKnowledge] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newKnowledge, setNewKnowledge] = useState({
        title: '',
        description: '',
        type: 'text',
        content: '',
        skillTags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const colors = {
        bg: '#0a0a0a',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        primary: '#2B81FF',
        success: '#10b981',
        error: '#dc2626',
        textMain: '#ffffff',
        textMuted: '#8A8A8A'
    };

    useEffect(() => {
        if (agentId) {
            fetchKnowledge();
        }
    }, [agentId]);

    const fetchKnowledge = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/agents/${agentId}/knowledge`);
            const data = await response.json();
            if (data.success) {
                setKnowledge(data.knowledge);
            }
        } catch (error) {
            console.error('Error fetching knowledge:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddKnowledge = async () => {
        if (!newKnowledge.title || !newKnowledge.content) {
            setMessage({ type: 'error', text: 'Title and content are required' });
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/agents/${agentId}/knowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKnowledge)
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Knowledge added successfully!' });
                fetchKnowledge();
                setIsAdding(false);
                setNewKnowledge({
                    title: '',
                    description: '',
                    type: 'text',
                    content: '',
                    skillTags: []
                });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            console.error('Error adding knowledge:', error);
            setMessage({ type: 'error', text: 'Failed to add knowledge' });
        }
    };

    const handleDeleteKnowledge = async (knowledgeId) => {
        if (!window.confirm('Are you sure you want to delete this knowledge item?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/agents/${agentId}/knowledge/${knowledgeId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Knowledge deleted' });
                fetchKnowledge();
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Error deleting knowledge:', error);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !newKnowledge.skillTags.includes(tagInput.trim())) {
            setNewKnowledge({
                ...newKnowledge,
                skillTags: [...newKnowledge.skillTags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setNewKnowledge({
            ...newKnowledge,
            skillTags: newKnowledge.skillTags.filter(t => t !== tag)
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'document': return <FileText size={16} />;
            case 'image': return <Image size={16} />;
            case 'video': return <Video size={16} />;
            case 'url': return <LinkIcon size={16} />;
            default: return <BookOpen size={16} />;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '24px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>
                            📚 Knowledge Base: {agentName}
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
                            Teach the agent with documents, images, and references
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.textMuted,
                            cursor: 'pointer',
                            fontSize: '20px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: message.type === 'success' ? `${colors.success}20` : `${colors.error}20`,
                        border: `1px solid ${message.type === 'success' ? colors.success : colors.error}`,
                        borderRadius: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: message.type === 'success' ? colors.success : colors.error
                    }}>
                        {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Add New Button */}
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: `${colors.primary}20`,
                            color: colors.primary,
                            border: `1px solid ${colors.primary}50`,
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Upload size={18} />
                        Add Knowledge
                    </button>
                )}

                {/* Add Form */}
                {isAdding && (
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '16px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800 }}>
                            Add New Knowledge
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newKnowledge.title}
                                    onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                                    placeholder="e.g., Material Design Guidelines"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        color: colors.textMain,
                                        fontSize: '13px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                                    Type
                                </label>
                                <select
                                    value={newKnowledge.type}
                                    onChange={(e) => setNewKnowledge({ ...newKnowledge, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        color: colors.textMain,
                                        fontSize: '13px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="text">Text / Notes</option>
                                    <option value="document">Document</option>
                                    <option value="image">Image / Design</option>
                                    <option value="video">Video</option>
                                    <option value="url">URL / Link</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                                    Content * {newKnowledge.type === 'url' ? '(URL)' : newKnowledge.type === 'image' || newKnowledge.type === 'document' ? '(File path or URL)' : ''}
                                </label>
                                <textarea
                                    value={newKnowledge.content}
                                    onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                                    placeholder={
                                        newKnowledge.type === 'text' ? 'Enter knowledge text...' :
                                        newKnowledge.type === 'url' ? 'https://...' :
                                        'File path or URL'
                                    }
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        color: colors.textMain,
                                        fontSize: '13px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                                    Description
                                </label>
                                <textarea
                                    value={newKnowledge.description}
                                    onChange={(e) => setNewKnowledge({ ...newKnowledge, description: e.target.value })}
                                    placeholder="What should the agent learn from this?"
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        color: colors.textMain,
                                        fontSize: '13px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                                    Skill Tags
                                </label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        placeholder="Add skill tag (e.g., 'Design Systems')"
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '8px',
                                            color: colors.textMain,
                                            fontSize: '12px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            color: colors.textMain,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                                {newKnowledge.skillTags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {newKnowledge.skillTags.map((tag, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '4px 10px',
                                                    backgroundColor: `${colors.primary}20`,
                                                    color: colors.primary,
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                {tag}
                                                <X
                                                    size={12}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleRemoveTag(tag)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button
                                    onClick={handleAddKnowledge}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: colors.primary,
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Knowledge
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: colors.textMuted,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Knowledge List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                            Loading knowledge...
                        </div>
                    ) : knowledge.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <BookOpen size={32} color={colors.textMuted} style={{ marginBottom: '12px' }} />
                            <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                                No knowledge added yet. Start teaching this agent!
                            </div>
                        </div>
                    ) : (
                        knowledge.map(item => {
                            let tags = [];
                            try {
                                tags = JSON.parse(item.skillTags || '[]');
                            } catch (e) {
                                tags = [];
                            }

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                {getTypeIcon(item.type)}
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>
                                                    {item.title}
                                                </h4>
                                            </div>
                                            {item.description && (
                                                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.textMuted, lineHeight: '1.5' }}>
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteKnowledge(item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: colors.error,
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        padding: '2px 8px',
                                                        backgroundColor: `${colors.success}20`,
                                                        color: colors.success,
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ fontSize: '10px', color: colors.textMuted }}>
                                        Used {item.usageCount} times
                                        {item.lastUsed && ` • Last used ${new Date(item.lastUsed).toLocaleDateString()}`}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentKnowledgeManager;
