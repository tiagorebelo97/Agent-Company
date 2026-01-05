import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Search, ExternalLink, FileCode, FileJson, FileText, FileImage, Settings } from 'lucide-react';
import FileEditorModal from './FileEditorModal';

// Helper function to get file icon based on extension
const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconProps = { size: 16, color: '#8A8A8A' };

    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs'].includes(ext)) {
        return <FileCode {...iconProps} color="#4FC3F7" />;
    }
    if (['json', 'yaml', 'yml', 'toml'].includes(ext)) {
        return <FileJson {...iconProps} color="#FFB74D" />;
    }
    if (['md', 'txt', 'log'].includes(ext)) {
        return <FileText {...iconProps} color="#81C784" />;
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
        return <FileImage {...iconProps} color="#E57373" />;
    }
    if (['env', 'config', 'conf'].includes(ext)) {
        return <Settings {...iconProps} color="#BA68C8" />;
    }
    return <File {...iconProps} />;
};

const FileTreeItem = ({ item, depth = 0, onFileClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isDirectory = item.type === 'directory';

    // Sort children: directories first, then files (both alphabetically)
    const sortedChildren = item.children ? [...item.children].sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
    }) : [];

    return (
        <div>
            <div
                onClick={() => isDirectory ? setIsOpen(!isOpen) : onFileClick(item)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    paddingLeft: `${depth * 16 + 12}px`,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s',
                    userSelect: 'none',
                    gap: '8px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                {isDirectory ? (
                    <>
                        {isOpen ? <ChevronDown size={14} color="#8A8A8A" /> : <ChevronRight size={14} color="#8A8A8A" />}
                        <Folder size={16} fill="#FFD700" color="#FFD700" style={{ opacity: 0.8 }} />
                    </>
                ) : (
                    <>
                        <div style={{ width: '14px' }} />
                        {getFileIcon(item.name)}
                    </>
                )}
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: isDirectory ? 600 : 400,
                    opacity: isDirectory ? 0.9 : 0.7
                }}>
                    {item.name}
                </span>
            </div>

            {isDirectory && isOpen && sortedChildren.length > 0 && (
                <div>
                    {sortedChildren.map((child, idx) => (
                        <FileTreeItem
                            key={idx}
                            item={child}
                            depth={depth + 1}
                            onFileClick={onFileClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectFileExplorer = ({ projectId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchFiles();
        }
    }, [projectId]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/projects/${projectId}/files`);
            const data = await response.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = (file) => {
        setSelectedFile(file);
        setShowEditor(true);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
        setSelectedFile(null);
    };

    const handleFileSaved = () => {
        // Optionally refresh files or show success message
        console.log('File saved successfully');
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Project Explorer</h3>
                    <span style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '10px', color: '#8A8A8A' }}>
                        LOCAL REPO
                    </span>
                </div>
                <button
                    onClick={fetchFiles}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2B81FF',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 700
                    }}
                >
                    REFRESH
                </button>
            </div>

            <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 36px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#8A8A8A' }}>Loading repository structure...</div>
                ) : files.length > 0 ? (
                    files.map((file, idx) => (
                        <FileTreeItem
                            key={idx}
                            item={file}
                            onFileClick={handleFileClick}
                        />
                    ))
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📁</div>
                        <div style={{ color: '#8A8A8A', fontSize: '14px' }}>No files found in this project.</div>
                        <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>Check if the local path is correctly set.</div>
                    </div>
                )}
            </div>

            {showEditor && selectedFile && (
                <FileEditorModal
                    file={selectedFile}
                    projectId={projectId}
                    onClose={handleCloseEditor}
                    onSave={handleFileSaved}
                />
            )}
        </div>
    );
};

export default ProjectFileExplorer;
