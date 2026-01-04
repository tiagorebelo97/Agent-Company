import React, { useState } from 'react';
import { X, Plus, Save, User, FileText, Globe } from 'lucide-react';

const ProjectCreateModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        clientName: '',
        repoUrl: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.1)',
        primary: '#2B81FF',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        success: '#10b981'
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                onSave(data.project);
                onClose();
            } else {
                setError(data.error || 'Failed to create project');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Create New Project</h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        padding: '4px'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            color: '#ef4444',
                            fontSize: '14px',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Project Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>PROJECT NAME</label>
                            <div style={{ position: 'relative' }}>
                                <FileText size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. CRM System Implementation"
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '12px',
                                        padding: '12px 12px 12px 40px',
                                        color: colors.textMain,
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Client Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>CLIENT NAME</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                                <input
                                    value={formData.clientName}
                                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '12px',
                                        padding: '12px 12px 12px 40px',
                                        color: colors.textMain,
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Repo URL */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>REPOSITORY URL</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                                <input
                                    value={formData.repoUrl}
                                    onChange={e => setFormData({ ...formData, repoUrl: e.target.value })}
                                    placeholder="https://github.com/..."
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '12px',
                                        padding: '12px 12px 12px 40px',
                                        color: colors.textMain,
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>DESCRIPTION</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the project objective..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: colors.textMain,
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 2,
                                padding: '12px',
                                backgroundColor: colors.primary,
                                border: 'none',
                                borderRadius: '12px',
                                color: '#ffffff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? 'Creating...' : <><Save size={18} /> Create Project</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectCreateModal;
