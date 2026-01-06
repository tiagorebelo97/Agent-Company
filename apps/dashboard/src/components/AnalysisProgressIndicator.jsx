import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';

const AnalysisProgressIndicator = ({ projectId }) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle, analyzing, complete, error
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !projectId) return;

        const handleProgress = (data) => {
            if (data.projectId === projectId) {
                setStatus('analyzing');
                setProgress(data.progress);
                setMessage(data.message);
            }
        };

        const handleComplete = (data) => {
            if (data.projectId === projectId) {
                setStatus('complete');
                setProgress(100);
                setMessage('Analysis complete!');
                setTimeout(() => {
                    setStatus('idle');
                    setProgress(0);
                    setMessage('');
                }, 5000);
            }
        };

        const handleError = (data) => {
            if (data.projectId === projectId) {
                setStatus('error');
                setProgress(0);
                setMessage(`Error: ${data.error}`);
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 5000);
            }
        };

        socket.on('analysis:progress', handleProgress);
        socket.on('analysis:complete', handleComplete);
        socket.on('analysis:error', handleError);

        return () => {
            socket.off('analysis:progress', handleProgress);
            socket.off('analysis:complete', handleComplete);
            socket.off('analysis:error', handleError);
        };
    }, [socket, projectId]);

    const colors = {
        primary: '#2B81FF',
        success: '#10b981',
        error: '#dc2626',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        border: 'rgba(255,255,255,0.08)'
    };

    if (status === 'idle') return null;

    return (
        <div style={{
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            marginBottom: '16px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {status === 'analyzing' && <Loader size={20} color={colors.primary} className="spin" />}
                {status === 'complete' && <CheckCircle size={20} color={colors.success} />}
                {status === 'error' && <AlertCircle size={20} color={colors.error} />}
                <span style={{ fontSize: '14px', fontWeight: 700, color: colors.textMain }}>
                    {message}
                </span>
            </div>
            {status === 'analyzing' && (
                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: colors.primary,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                    }} />
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

export default AnalysisProgressIndicator;
