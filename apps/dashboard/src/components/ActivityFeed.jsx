import React, { useState, useEffect, useRef } from 'react';
import { Activity, MessageSquare, Zap, CheckCircle, AlertCircle, Filter } from 'lucide-react';

const ActivityFeed = ({ socket, events: eventsProp }) => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('all');
    const feedRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        message: '#3B82F6',
        status: '#10B981',
        task: '#F59E0B',
        system: '#8B5CF6',
        error: '#EF4444'
    };

    useEffect(() => {
        if (!socket || eventsProp) return;

        // Listen for various event types
        socket.on('agent:status', (data) => {
            addEvent({
                id: Date.now() + Math.random(),
                type: 'status',
                timestamp: new Date(),
                agentId: data.agentId,
                agentName: data.agentName || data.agentId,
                message: `Status changed to ${data.status}`,
                data: data
            });
        });

        socket.on('agent:message', (data) => {
            let messageContent = data.message || data.content;
            if (messageContent && typeof messageContent === 'object' && messageContent.text) {
                messageContent = messageContent.text;
            }

            addEvent({
                id: Date.now() + Math.random(),
                type: 'message',
                timestamp: new Date(),
                agentId: data.from || data.agentId,
                agentName: data.fromName || data.agentName || data.from || data.agentId,
                message: messageContent,
                data: data
            });
        });

        socket.on('task:assigned', (data) => {
            addEvent({
                id: Date.now() + Math.random(),
                type: 'task',
                timestamp: new Date(),
                agentId: data.agentId,
                agentName: data.agentName || data.agentId,
                message: `Assigned task: ${data.taskName}`,
                data: data
            });
        });

        socket.on('system:notification', (data) => {
            addEvent({
                id: Date.now() + Math.random(),
                type: 'system',
                timestamp: new Date(),
                message: data.message,
                data: data
            });
        });

        socket.on('agent:registered', (data) => {
            addEvent({
                id: Date.now() + Math.random(),
                type: 'system',
                timestamp: new Date(),
                message: `New agent registered: ${data.name}`,
                data: data
            });
        });

        return () => {
            socket.off('agent:status');
            socket.off('agent:message');
            socket.off('task:assigned');
            socket.off('system:notification');
            socket.off('agent:registered');
        };
    }, [socket, eventsProp]);

    // Use internal state if eventsProp is not provided
    const displayEvents = eventsProp || events;

    const addEvent = (event) => {
        // If controlled component (eventsProp exists), do nothing internally (parent handles it)
        // But since we only listen if !eventsProp, this is fine
        setEvents(prev => [event, ...prev].slice(0, 100));
    };



    useEffect(() => {
        if (autoScroll && feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [events, autoScroll]);

    const getEventIcon = (type) => {
        switch (type) {
            case 'message': return <MessageSquare size={16} />;
            case 'status': return <Zap size={16} />;
            case 'task': return <CheckCircle size={16} />;
            case 'system': return <Activity size={16} />;
            case 'error': return <AlertCircle size={16} />;
            default: return <Activity size={16} />;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'message': return colors.message;
            case 'status': return colors.status;
            case 'task': return colors.task;
            case 'system': return colors.system;
            case 'error': return colors.error;
            default: return colors.textMuted;
        }
    };

    const formatTime = (date) => {
        // Validate date object
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            // Try to parse if it's a string
            if (typeof date === 'string' || typeof date === 'number') {
                const parsed = new Date(date);
                if (!isNaN(parsed.getTime())) {
                    date = parsed;
                } else {
                    return 'N/A';
                }
            } else {
                return 'N/A';
            }
        }

        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        try {
            return date.toLocaleDateString();
        } catch (e) {
            return 'N/A';
        }
    };

    const filteredEvents = filter === 'all'
        ? displayEvents
        : displayEvents.filter(e => e.type === filter);

    const eventTypes = ['all', 'message', 'status', 'task', 'system'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '24px',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '24px',
                borderBottom: `1px solid ${colors.border}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Activity size={24} style={{ color: colors.system }} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: colors.textMain }}>
                            Live Activity
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>
                            Real-time swarm events
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {eventTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                transition: 'all 0.2s ease',
                                backgroundColor: filter === type ? 'white' : 'rgba(255,255,255,0.05)',
                                color: filter === type ? 'black' : colors.textMuted,
                                border: filter === type ? 'none' : `1px solid ${colors.border}`,
                                cursor: 'pointer'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events List */}
            <div
                ref={feedRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px'
                }}
            >
                {filteredEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 16px',
                        color: colors.textMuted
                    }}>
                        <Activity size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>No activity yet</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>Events will appear here in real-time</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredEvents.map(event => (
                            <div
                                key={event.id}
                                style={{
                                    padding: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = `${getEventColor(event.type)}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = colors.border;
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: `${getEventColor(event.type)}15`,
                                        border: `1px solid ${getEventColor(event.type)}30`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: getEventColor(event.type),
                                        flexShrink: 0
                                    }}>
                                        {getEventIcon(event.type)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: getEventColor(event.type),
                                                textTransform: 'uppercase'
                                            }}>
                                                {event.agentName || event.type}
                                            </span>
                                            <span style={{
                                                fontSize: '10px',
                                                color: colors.textMuted,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {formatTime(event.timestamp)}
                                            </span>
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            color: colors.textMain,
                                            lineHeight: '1.5'
                                        }}>
                                            {typeof event.message === 'object' ? event.message.text : event.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '12px 24px',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 600 }}>
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 600 }}>
                        Auto-scroll
                    </span>
                </label>
            </div>
        </div>
    );
};

export default ActivityFeed;
