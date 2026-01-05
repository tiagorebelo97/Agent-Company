import React, { useState, useEffect } from 'react';
import { Users, Send, Download, CheckCircle, Video, MessageCircle } from 'lucide-react';

const MeetingRoom = ({ meetingId, projectId, agents = [], onClose }) => {
    const [meeting, setMeeting] = useState(null);
    const [message, setMessage] = useState('');
    const [transcript, setTranscript] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (meetingId) {
            fetchMeeting();
        }
    }, [meetingId]);

    const fetchMeeting = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/meetings/${meetingId}`);
            const data = await response.json();
            if (data.success) {
                setMeeting(data.meeting);
                try {
                    setTranscript(JSON.parse(data.meeting.transcript));
                } catch (e) {
                    setTranscript([]);
                }
            }
        } catch (error) {
            console.error('Error fetching meeting:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/meetings/${meetingId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromId: 'user',
                    content: message.trim()
                })
            });
            const data = await response.json();
            if (data.success) {
                setMessage('');
                // Refresh meeting to get agent responses
                setTimeout(() => fetchMeeting(), 2000);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format = 'json') => {
        try {
            const response = await fetch(`http://localhost:3001/api/meetings/${meetingId}/export?format=${format}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meeting-${meetingId}.${format === 'text' ? 'txt' : 'json'}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error exporting meeting:', error);
        }
    };

    const handleComplete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/meetings/${meetingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            });
            if (response.ok) {
                fetchMeeting();
            }
        } catch (error) {
            console.error('Error completing meeting:', error);
        }
    };

    const colors = {
        bg: '#0a0a0a',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        primary: '#2B81FF',
        success: '#10b981',
        textMain: '#ffffff',
        textMuted: '#8A8A8A'
    };

    if (!meeting) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                Loading meeting...
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: '600px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Video size={20} color={colors.primary} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{meeting.title}</h3>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                            {meeting.participants.length} participants • {meeting.status}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => handleExport('json')}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: colors.textMuted,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Download size={14} />
                        Export
                    </button>
                    {meeting.status === 'active' && (
                        <button
                            onClick={handleComplete}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: `${colors.success}20`,
                                color: colors.success,
                                border: `1px solid ${colors.success}50`,
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <CheckCircle size={14} />
                            Complete
                        </button>
                    )}
                </div>
            </div>

            {/* Participants */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`
            }}>
                {meeting.participants.map((p, idx) => {
                    const agent = agents.find(a => a.id === p.agentId) || {};
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        >
                            <span>{agent.emoji || '🤖'}</span>
                            <span>{agent.name || p.agentId}</span>
                        </div>
                    );
                })}
            </div>

            {/* Transcript */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`
            }}>
                {transcript.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                        <MessageCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                        <div style={{ fontSize: '13px' }}>No messages yet. Start the conversation!</div>
                    </div>
                ) : (
                    transcript.map((msg, idx) => {
                        const agent = agents.find(a => a.id === msg.fromId) || {};
                        const isUser = msg.fromId === 'user';
                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    padding: '12px',
                                    backgroundColor: isUser ? 'rgba(43, 129, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: `1px solid ${isUser ? colors.primary + '30' : colors.border}`
                                }}
                            >
                                <div style={{ fontSize: '20px', flexShrink: 0 }}>
                                    {isUser ? '👤' : agent.emoji || '🤖'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                                        {isUser ? 'You' : agent.name || msg.fromId}
                                        <span style={{ marginLeft: '8px', fontSize: '10px', color: colors.textMuted, fontWeight: 400 }}>
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.5' }}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Message Input */}
            {meeting.status === 'active' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !loading) {
                                handleSendMessage();
                            }
                        }}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            color: colors.textMain,
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !message.trim()}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: loading || !message.trim() ? 'rgba(255,255,255,0.05)' : colors.primary,
                            color: loading || !message.trim() ? colors.textMuted : '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Send size={16} />
                        Send
                    </button>
                </div>
            )}
        </div>
    );
};

export default MeetingRoom;
