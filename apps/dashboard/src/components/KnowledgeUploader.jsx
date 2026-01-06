import React, { useState } from 'react';
import { Upload, FileText, Image, Video, Link as LinkIcon, Loader } from 'lucide-react';

const KnowledgeUploader = ({ agentId, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadType, setUploadType] = useState('file'); // file, url, text
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        text: '',
        skillTags: []
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState(null);

    const colors = {
        primary: '#2B81FF',
        success: '#10b981',
        error: '#dc2626',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        border: 'rgba(255,255,255,0.08)'
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!formData.title) {
                setFormData({ ...formData, title: file.name });
            }
        }
    };

    const handleUpload = async () => {
        if (!formData.title) {
            setMessage({ type: 'error', text: 'Title is required' });
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            if (uploadType === 'file' && selectedFile) {
                // File upload
                const data = new FormData();
                data.append('file', selectedFile);
                data.append('title', formData.title);
                data.append('description', formData.description);
                data.append('skillTags', JSON.stringify(formData.skillTags));

                const response = await fetch(`http://localhost:3001/api/agents/${agentId}/learn`, {
                    method: 'POST',
                    body: data
                });

                const result = await response.json();
                if (result.success) {
                    setMessage({ type: 'success', text: 'File uploaded and processed!' });
                    resetForm();
                    if (onUploadComplete) onUploadComplete();
                } else {
                    setMessage({ type: 'error', text: result.error || 'Upload failed' });
                }
            } else if (uploadType === 'url') {
                // URL knowledge
                const response = await fetch(`http://localhost:3001/api/agents/${agentId}/knowledge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        type: 'url',
                        content: formData.url,
                        skillTags: formData.skillTags
                    })
                });

                const result = await response.json();
                if (result.success) {
                    setMessage({ type: 'success', text: 'URL knowledge added!' });
                    resetForm();
                    if (onUploadComplete) onUploadComplete();
                } else {
                    setMessage({ type: 'error', text: result.error || 'Failed to add knowledge' });
                }
            } else if (uploadType === 'text') {
                // Text knowledge
                const response = await fetch(`http://localhost:3001/api/agents/${agentId}/knowledge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        type: 'text',
                        content: formData.text,
                        skillTags: formData.skillTags
                    })
                });

                const result = await response.json();
                if (result.success) {
                    setMessage({ type: 'success', text: 'Text knowledge added!' });
                    resetForm();
                    if (onUploadComplete) onUploadComplete();
                } else {
                    setMessage({ type: 'error', text: result.error || 'Failed to add knowledge' });
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Upload failed. See console for details.' });
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', url: '', text: '', skillTags: [] });
        setSelectedFile(null);
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px'
        }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700 }}>Add Knowledge</h4>

            {/* Upload Type Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['file', 'url', 'text'].map(type => (
                    <button
                        key={type}
                        onClick={() => setUploadType(type)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: uploadType === type ? `${colors.primary}20` : 'rgba(255,255,255,0.05)',
                            color: uploadType === type ? colors.primary : colors.textMuted,
                            border: `1px solid ${uploadType === type ? colors.primary : colors.border}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Title Input */}
            <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: colors.textMain,
                    fontSize: '13px',
                    marginBottom: '12px'
                }}
            />

            {/* Description Input */}
            <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: colors.textMain,
                    fontSize: '13px',
                    marginBottom: '12px',
                    minHeight: '60px',
                    resize: 'vertical'
                }}
            />

            {/* Type-specific inputs */}
            {uploadType === 'file' && (
                <div style={{ marginBottom: '12px' }}>
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            color: colors.textMain,
                            fontSize: '13px'
                        }}
                    />
                    {selectedFile && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: colors.textMuted }}>
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </div>
                    )}
                </div>
            )}

            {uploadType === 'url' && (
                <input
                    type="url"
                    placeholder="https://example.com/document"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        color: colors.textMain,
                        fontSize: '13px',
                        marginBottom: '12px'
                    }}
                />
            )}

            {uploadType === 'text' && (
                <textarea
                    placeholder="Paste your text content here..."
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        color: colors.textMain,
                        fontSize: '13px',
                        marginBottom: '12px',
                        minHeight: '120px',
                        resize: 'vertical'
                    }}
                />
            )}

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: colors.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                {uploading ? (
                    <>
                        <Loader size={16} className="spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Upload size={16} />
                        Add Knowledge
                    </>
                )}
            </button>

            {/* Message */}
            {message && (
                <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: message.type === 'success' ? `${colors.success}20` : `${colors.error}20`,
                    color: message.type === 'success' ? colors.success : colors.error,
                    borderRadius: '8px',
                    fontSize: '12px'
                }}>
                    {message.text}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default KnowledgeUploader;
