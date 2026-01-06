import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle } from 'lucide-react';

const PastMeetingsList = ({ projectId, onSelectMeeting }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projectId && projectId !== 'all' && projectId !== 'unassigned') {
            fetchMeetings();
        } else {
            setMeetings([]);
        }
    }, [projectId]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/meetings?projectId=${projectId}`);
            const data = await response.json();
            if (data.success) {
                setMeetings(data.meetings || []);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const colors = {
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        primary: '#2B81FF',
        textMain: '#ffffff',
        textMuted: '#8A8A8A'
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted }}>Loading meetings...</div>;
    }

    if (meetings.length === 0) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
                <Users size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>No meetings yet</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Create a new meeting to collaborate with agents</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: colors.textMain }}>Meeting History</h3>
            {meetings.map(meeting => {
                let taskCount = 0;
                try {
                    taskCount = JSON.parse(meeting.linkedTasks || '[]').length;
                } catch (e) { }

                return (
                    <div
                        key={meeting.id}
                        onClick={() => onSelectMeeting(meeting.id)}
                        style={{
                            padding: '20px',
                            backgroundColor: colors.card,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.primary;
                            e.currentTarget.style.backgroundColor = 'rgba(43, 129, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = colors.border;
                            e.currentTarget.style.backgroundColor = colors.card;
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{meeting.title}</h4>
                                {meeting.description && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
                                        {meeting.description}
                                    </p>
                                )}
                            </div>
                            <span style={{
                                padding: '4px 10px',
                                backgroundColor: meeting.status === 'active' ? `${colors.primary}20` : 'rgba(255,255,255,0.05)',
                                color: meeting.status === 'active' ? colors.primary : colors.textMuted,
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>
                                {meeting.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: colors.textMuted }}>
                            <span>👥 {meeting.participants?.length || 0} participants</span>
                            <span>📋 {taskCount} tasks</span>
                            <span>📅 {new Date(meeting.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PastMeetingsList;
