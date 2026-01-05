import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Save, FileCode, AlertCircle } from 'lucide-react';

const FileEditorModal = ({ file, projectId, onClose, onSave }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (file) {
            fetchFileContent();
        }
    }, [file]);

    const fetchFileContent = async () => {
        setLoading(true);
        setError(null);

        console.log('File object:', file);
        console.log('File path:', file.path);

        if (!file.path) {
            setError('File path is missing');
            setLoading(false);
            return;
        }

        try {
            const url = `http://localhost:3001/api/projects/${projectId}/files/${encodeURIComponent(file.path)}`;
            console.log('Fetching URL:', url);

            const response = await fetch(url);
            const data = await response.json();

            console.log('Response:', data);

            if (data.success) {
                setContent(data.content);
            } else {
                setError(data.error || 'Failed to load file');
            }
        } catch (err) {
            setError('Failed to fetch file content');
            console.error('Error fetching file:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/files/${encodeURIComponent(file.path)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            if (data.success) {
                setHasChanges(false);
                if (onSave) onSave();
            } else {
                setError(data.error || 'Failed to save file');
            }
        } catch (err) {
            setError('Failed to save file');
            console.error('Error saving file:', err);
        } finally {
            setSaving(false);
        }
    };

    const getLanguage = (filename) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'md': 'markdown',
            'yaml': 'yaml',
            'yml': 'yaml',
            'xml': 'xml',
            'sql': 'sql',
            'sh': 'shell',
            'bash': 'shell',
        };
        return languageMap[ext] || 'plaintext';
    };

    if (!file) return null;

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
                width: '90%',
                maxWidth: '1200px',
                height: '85vh',
                backgroundColor: '#1e1e1e',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#252526'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileCode size={20} color="#4FC3F7" />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                                {file.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8A8A8A', marginTop: '2px' }}>
                                {file.path}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {hasChanges && (
                            <span style={{
                                fontSize: '11px',
                                color: '#FFB74D',
                                padding: '4px 8px',
                                backgroundColor: 'rgba(255, 183, 77, 0.1)',
                                borderRadius: '4px'
                            }}>
                                Unsaved changes
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: hasChanges ? '#2B81FF' : 'rgba(255, 255, 255, 0.05)',
                                color: hasChanges ? '#fff' : '#666',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: hasChanges ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Save size={14} />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#8A8A8A',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(229, 115, 115, 0.1)',
                        borderBottom: '1px solid rgba(229, 115, 115, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#E57373'
                    }}>
                        <AlertCircle size={16} />
                        <span style={{ fontSize: '13px' }}>{error}</span>
                    </div>
                )}

                {/* Editor */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#8A8A8A'
                        }}>
                            Loading file...
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            language={getLanguage(file.name)}
                            value={content}
                            onChange={(value) => {
                                setContent(value);
                                setHasChanges(true);
                            }}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: true },
                                fontSize: 13,
                                lineNumbers: 'on',
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileEditorModal;
