import React from 'react';

const AddTaskStatisticsWidgetDashboard = () => {
    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    };

    return (
        <div style={{
            padding: '24px',
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px'
        }}>
            <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: 700,
                color: colors.textMain
            }}>
                AddTaskStatisticsWidgetDashboard
            </h3>
            <p style={{
                margin: 0,
                fontSize: '14px',
                color: colors.textMuted
            }}>
                Create a new component that displays task statistics: total tasks, tasks by status (todo, in_progress, review, done), and tasks by priority.
            </p>
        </div>
    );
};

export default AddTaskStatisticsWidgetDashboard;
