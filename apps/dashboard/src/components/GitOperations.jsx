import React, { useState, useEffect } from 'react';
import { GitBranch, Download, GitCommit, Upload, RefreshCw, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const GitOperations = ({ projectId }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [operation, setOperation] = useState(null);
    const [message, setMessage] = useState('');
    const [commitMessage, setCommitMessage] = useState('');

    useEffect(() => {
        if (projectId) {
            fetchStatus();
        }
    }, [projectId]);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/git/status`);
            const data = await response.json();
            if (data.success) {
                setStatus(data.status);
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            console.error('Error fetching git status:', error);
            setMessage({ type: 'error', text: 'Failed to fetch git status' });
        } finally {
            setLoading(false);
        }
    };

    const handlePull = async () => {
        try {
            setOperation('pull');
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/git/pull`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Successfully pulled changes from remote' });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            console.error('Error pulling changes:', error);
            setMessage({ type: 'error', text: 'Failed to pull changes' });
        } finally {
            setLoading(false);
            setOperation(null);
        }
    };

    const handlePush = async () => {
        try {
            setOperation('push');
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/git/push`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Successfully pushed changes to remote' });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            console.error('Error pushing changes:', error);
            setMessage({ type: 'error', text: 'Failed to push changes' });
        } finally {
            setLoading(false);
            setOperation(null);
        }
    };

    const handleCommit = async () => {
        if (!commitMessage.trim()) {
            setMessage({ type: 'error', text: 'Commit message is required' });
            return;
        }

        try {
            setOperation('commit');
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/git/commit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: commitMessage })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: `Committed changes: ${commitMessage}` });
                setCommitMessage('');
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            console.error('Error committing changes:', error);
            setMessage({ type: 'error', text: 'Failed to commit changes' });
        } finally {
            setLoading(false);
            setOperation(null);
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

    const hasChanges = status && (
        status.files.length > 0 ||
        status.not_added.length > 0 ||
        status.modified.length > 0
    );

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
                    <GitBranch size={20} color={colors.primary} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Git Operations</h3>
                </div>
                <button
                    onClick={fetchStatus}
                    disabled={loading}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: colors.primary,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                        message.type === 'error' ? 'rgba(220, 38, 38, 0.1)' :
                            'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${message.type === 'success' ? colors.success :
                        message.type === 'error' ? colors.error :
                            colors.warning}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: message.type === 'success' ? colors.success :
                        message.type === 'error' ? colors.error :
                            colors.warning
                }}>
                    {message.type === 'success' ? <CheckCircle size={16} /> :
                        message.type === 'error' ? <XCircle size={16} /> :
                            <AlertCircle size={16} />}
                    <span>{message.text}</span>
                </div>
            )}

            {status && (
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textMuted }}>Branch:</span>
                            <span style={{ fontWeight: 700 }}>{status.current}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textMuted }}>Modified:</span>
                            <span style={{ color: status.modified.length > 0 ? colors.warning : colors.textMuted }}>
                                {status.modified.length} files
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textMuted }}>Staged:</span>
                            <span style={{ color: status.staged.length > 0 ? colors.success : colors.textMuted }}>
                                {status.staged.length} files
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textMuted }}>Ahead:</span>
                            <span>{status.ahead || 0} commits</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textMuted }}>Behind:</span>
                            <span>{status.behind || 0} commits</span>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hasChanges && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Commit message..."
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '13px',
                                outline: 'none'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && commitMessage.trim()) {
                                    handleCommit();
                                }
                            }}
                        />
                        <button
                            onClick={handleCommit}
                            disabled={loading || !commitMessage.trim()}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: loading || !commitMessage.trim() ? 'rgba(255,255,255,0.05)' : colors.success,
                                color: loading || !commitMessage.trim() ? colors.textMuted : '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: loading || !commitMessage.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {operation === 'commit' ? <Loader size={16} className="animate-spin" /> : <GitCommit size={16} />}
                            Commit Changes
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                        onClick={handlePull}
                        disabled={loading}
                        style={{
                            padding: '12px 16px',
                            backgroundColor: loading ? 'rgba(255,255,255,0.05)' : 'rgba(43, 129, 255, 0.1)',
                            color: loading ? colors.textMuted : colors.primary,
                            border: `1px solid ${loading ? colors.border : colors.primary + '50'}`,
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {operation === 'pull' ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                        Pull
                    </button>
                    <button
                        onClick={handlePush}
                        disabled={loading || !hasChanges}
                        style={{
                            padding: '12px 16px',
                            backgroundColor: loading || !hasChanges ? 'rgba(255,255,255,0.05)' : 'rgba(43, 129, 255, 0.1)',
                            color: loading || !hasChanges ? colors.textMuted : colors.primary,
                            border: `1px solid ${loading || !hasChanges ? colors.border : colors.primary + '50'}`,
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: loading || !hasChanges ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {operation === 'push' ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                        Push
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GitOperations;
