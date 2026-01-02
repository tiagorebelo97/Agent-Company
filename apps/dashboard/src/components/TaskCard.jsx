import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TaskCard = ({ task, agents, onClick, isDragging }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1
    };

    const colors = {
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        low: '#3b82f6',
        medium: '#f59e0b',
        high: '#ef4444'
    };

    const priorityColor = colors[task.priority] || colors.medium;

    // Parse tags
    let tags = [];
    try {
        tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags || [];
    } catch (e) {
        tags = [];
    }

    // Get assigned agents
    const assignedAgents = task.agents?.map(ta => ta.agent) || [];

    // Check if overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                padding: '16px',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${priorityColor}`,
                borderRadius: '12px',
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: 'all 0.2s ease',
                position: 'relative'
            }}
            {...attributes}
            {...listeners}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (!isDragging) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isDragging) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            {/* Priority Badge */}
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 8px',
                backgroundColor: `${priorityColor}20`,
                border: `1px solid ${priorityColor}40`,
                borderRadius: '6px',
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: priorityColor
            }}>
                {task.priority}
            </div>

            {/* Title */}
            <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 700,
                color: colors.textMain,
                paddingRight: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
            }}>
                {task.title}
            </h4>

            {/* Progress Bar for In Progress Tasks */}
            {task.status === 'in_progress' && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px'
                    }}>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#3b82f6',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            🔄 Processing
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                            background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s ease-in-out infinite'
                        }} />
                    </div>
                    <style>{`
                        @keyframes shimmer {
                            0% { background-position: -200% 0; }
                            100% { background-position: 200% 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* Description */}
            {task.description && (
                <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '12px',
                    color: colors.textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {task.description}
                </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 600,
                                color: colors.textMuted
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span style={{
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: colors.textMuted
                        }}>
                            +{tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                {/* Assigned Agents */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {assignedAgents.slice(0, 3).map((agent, idx) => (
                        <div
                            key={idx}
                            title={agent.name}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '8px',
                                backgroundColor: `${agent.color}20`,
                                border: `1px solid ${agent.color}40`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                            }}
                        >
                            {agent.emoji || '🤖'}
                        </div>
                    ))}
                    {assignedAgents.length > 3 && (
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            fontWeight: 700,
                            color: colors.textMuted
                        }}>
                            +{assignedAgents.length - 3}
                        </div>
                    )}
                </div>

                {/* Due Date / Overdue Warning */}
                {task.dueDate && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: isOverdue ? '#ef4444' : colors.textMuted
                    }}>
                        {isOverdue && <AlertCircle size={12} />}
                        <Calendar size={12} />
                        {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </div>
                )}
            </div>

            {/* Subtasks Progress */}
            {task.subtasks && task.subtasks.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                    <div style={{
                        height: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                            backgroundColor: priorityColor,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: colors.textMuted
                    }}>
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
