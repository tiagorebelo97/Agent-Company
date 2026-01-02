import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const TaskProgressTracker = ({ task }) => {
    const [progress, setProgress] = useState(0);
    const [currentActivity, setCurrentActivity] = useState('');
    const [activityLogs, setActivityLogs] = useState([]);
    const [filesModified, setFilesModified] = useState([]);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    };

    useEffect(() => {
        if (!task || task.status !== 'in_progress') return;

        // Listen for progress updates
        const handleProgress = (data) => {
            if (data.taskId === task.id) {
                setProgress(data.progress);
                setCurrentActivity(data.activity);
            }
        };

        // Listen for activity logs
        const handleActivity = (data) => {
            if (data.taskId === task.id) {
                setActivityLogs(prev => [...prev, {
                    message: data.message,
                    timestamp: data.timestamp,
                    agentName: data.agentName
                }]);
            }
        };

        // Listen for file modifications
        const handleFileModified = (data) => {
            if (data.taskId === task.id && !filesModified.includes(data.file)) {
                setFilesModified(prev => [...prev, data.file]);
            }
        };

        socket.on('task:progress', handleProgress);
        socket.on('task:activity', handleActivity);
        socket.on('task:file_modified', handleFileModified);

        return () => {
            socket.off('task:progress', handleProgress);
            socket.off('task:activity', handleActivity);
            socket.off('task:file_modified', handleFileModified);
        };
    }, [task?.id, task?.status]);

    // Auto-scroll logs to bottom
    useEffect(() => {
        const logContainer = document.getElementById('activity-log-container');
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }, [activityLogs]);

    if (!task || task.status !== 'in_progress') {
        return null;
    }

    return (
        <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px'
        }}>
            <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '15px',
                fontWeight: 700,
                color: colors.textMain,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                🔄 Task Progress
            </h4>

            {/* Progress Bar */}
            <div style={{
                marginBottom: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                }}>
                    <span style={{
                        fontSize: '13px',
                        color: colors.textMuted
                    }}>
                        Progress
                    </span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.primary
                    }}>
                        {progress}%
                    </span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: colors.primary,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                    }} />
                </div>
            </div>

            {/* Current Activity */}
            {currentActivity && (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#111',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: colors.textMuted,
                        marginBottom: '4px'
                    }}>
                        Current Activity:
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: colors.textMain,
                        fontWeight: 600
                    }}>
                        {currentActivity}
                    </div>
                </div>
            )}

            {/* Activity Log */}
            {activityLogs.length > 0 && (
                <div style={{
                    marginBottom: '16px'
                }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: '8px'
                    }}>
                        Activity Log
                    </div>
                    <div
                        id="activity-log-container"
                        style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backgroundColor: '#0d0d0d',
                            borderRadius: '8px',
                            padding: '12px'
                        }}
                    >
                        {activityLogs.map((log, idx) => (
                            <div
                                key={idx}
                                style={{
                                    fontSize: '12px',
                                    color: '#aaa',
                                    marginBottom: '8px',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.5'
                                }}
                            >
                                <span style={{
                                    color: '#666',
                                    marginRight: '8px'
                                }}>
                                    {new Date(log.timestamp * 1000).toLocaleTimeString()}
                                </span>
                                <span style={{
                                    color: colors.primary,
                                    marginRight: '8px'
                                }}>
                                    [{log.agentName}]
                                </span>
                                <span>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Files Modified */}
            {filesModified.length > 0 && (
                <div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: colors.textMain,
                        marginBottom: '8px'
                    }}>
                        📁 Files Modified
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        {filesModified.map((file, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: 'rgba(43, 129, 255, 0.1)',
                                    border: `1px solid ${colors.primary}40`,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    color: colors.textMain
                                }}
                            >
                                {file}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskProgressTracker;
