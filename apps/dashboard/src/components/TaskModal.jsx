import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import TaskProgressTracker from './TaskProgressTracker';

const TaskModal = ({ task, agents, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        tags: [],
        dueDate: '',
        agentIds: []
    });
    const [newTag, setNewTag] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [subtasks, setSubtasks] = useState([]);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF',
        danger: '#ef4444'
    };

    useEffect(() => {
        if (task) {
            let tags = [];
            try {
                tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags || [];
            } catch (e) {
                tags = [];
            }

            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                status: task.status || 'todo',
                tags,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                agentIds: task.agents?.map(ta => ta.agentId) || []
            });
            setSubtasks(task.subtasks || []);
        }
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            tags: formData.tags
        };

        try {
            const url = task
                ? `http://localhost:3001/api/tasks/${task.id}`
                : 'http://localhost:3001/api/tasks';

            const method = task ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Handle subtasks for new tasks
                if (!task && subtasks.length > 0) {
                    const data = await response.json();
                    const taskId = data.task.id;

                    await Promise.all(
                        subtasks.map(subtask =>
                            fetch(`http://localhost:3001/api/tasks/${taskId}/subtasks`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title: subtask.title })
                            })
                        )
                    );
                }

                onSave();
                onClose();
            }
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleDelete = async () => {
        if (!task || !window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                onSave();
                onClose();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleAddTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleAddSubtask = () => {
        if (newSubtask) {
            setSubtasks(prev => [...prev, { title: newSubtask, completed: false }]);
            setNewSubtask('');
        }
    };

    const handleToggleSubtask = async (index) => {
        const subtask = subtasks[index];

        if (task && subtask.id) {
            // Update existing subtask
            try {
                await fetch(`http://localhost:3001/api/tasks/${task.id}/subtasks/${subtask.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: !subtask.completed })
                });
            } catch (error) {
                console.error('Error updating subtask:', error);
            }
        }

        setSubtasks(prev => prev.map((s, i) =>
            i === index ? { ...s, completed: !s.completed } : s
        ));
    };

    const handleAgentToggle = (agentId) => {
        setFormData(prev => ({
            ...prev,
            agentIds: prev.agentIds.includes(agentId)
                ? prev.agentIds.filter(id => id !== agentId)
                : [...prev.agentIds, agentId]
        }));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 800,
                        color: colors.textMain
                    }}>
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.textMuted,
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {/* Title */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textMain
                        }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textMain
                        }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Priority & Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: colors.textMain
                            }}>
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    color: colors.textMain,
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: colors.textMain
                            }}>
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    color: colors.textMain,
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textMain
                        }}>
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Assigned Agents */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textMain
                        }}>
                            Assign Agents
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px'
                        }}>
                            {agents.map(agent => (
                                <div
                                    key={agent.id}
                                    onClick={() => handleAgentToggle(agent.id)}
                                    style={{
                                        padding: '8px',
                                        backgroundColor: formData.agentIds.includes(agent.id)
                                            ? `${agent.color}20`
                                            : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${formData.agentIds.includes(agent.id)
                                            ? agent.color
                                            : colors.border}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>{agent.emoji || '🤖'}</span>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: colors.textMain,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {agent.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textMain
                        }}>
                            Tags
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                placeholder="Add tag..."
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    color: colors.textMain,
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    color: colors.textMain,
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {formData.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        padding: '6px 10px',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: colors.textMain,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {tag}
                                    <X
                                        size={14}
                                        onClick={() => handleRemoveTag(tag)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: colors.textMain
                        }}>
                            Subtasks
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                                placeholder="Add subtask..."
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    color: colors.textMain,
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '8px',
                                    color: colors.textMain,
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {subtasks.map((subtask, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <div
                                        onClick={() => handleToggleSubtask(idx)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '4px',
                                            border: `2px solid ${colors.primary}`,
                                            backgroundColor: subtask.completed ? colors.primary : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    >
                                        {subtask.completed && <Check size={12} color="#fff" />}
                                    </div>
                                    <span style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        color: subtask.completed ? colors.textMuted : colors.textMain,
                                        textDecoration: subtask.completed ? 'line-through' : 'none'
                                    }}>
                                        {subtask.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Result (for Completed Tasks) */}
                    {task && (task.status === 'done' || task.status === 'completed') && task.result && (
                        <div style={{ padding: '24px 0', borderTop: `1px solid ${colors.border}` }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={18} />
                                Task Execution Result
                            </h3>
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '12px',
                                padding: '16px',
                                fontSize: '13px',
                                color: colors.textMain
                            }}>
                                {(() => {
                                    try {
                                        const resultObj = typeof task.result === 'string' ? JSON.parse(task.result) : task.result;

                                        // Pretty display for our standard agent response format
                                        if (resultObj.success !== undefined) {
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div>
                                                        <strong style={{ color: '#10b981' }}>Status:</strong> {resultObj.success ? 'Success' : 'Failed'}
                                                    </div>

                                                    {resultObj.result && resultObj.result.file && (
                                                        <div>
                                                            <strong style={{ color: colors.textMuted }}>Generated Component:</strong>
                                                            <div style={{ marginTop: '4px', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                                                                {resultObj.result.component} <span style={{ opacity: 0.5 }}>({resultObj.result.file})</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {resultObj.files_modified && resultObj.files_modified.length > 0 && (
                                                        <div>
                                                            <strong style={{ color: colors.textMuted }}>Modified Files:</strong>
                                                            <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                                                                {resultObj.files_modified.map(f => (
                                                                    <li key={f} style={{ fontFamily: 'monospace' }}>{f}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {resultObj.message && (
                                                        <div>
                                                            <strong style={{ color: colors.textMuted }}>Message:</strong>
                                                            <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{resultObj.message}</p>
                                                        </div>
                                                    )}

                                                    {/* Fallback for other fields */}
                                                    {!resultObj.result && !resultObj.files_modified && !resultObj.message && (
                                                        <pre style={{ margin: 0, overflowX: 'auto' }}>
                                                            {JSON.stringify(resultObj, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // Fallback for generic JSON
                                        return <pre style={{ margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{JSON.stringify(resultObj, null, 2)}</pre>;
                                    } catch (e) {
                                        return <div style={{ whiteSpace: 'pre-wrap' }}>{String(task.result)}</div>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Task Progress Tracker (for in_progress tasks) */}
                    <TaskProgressTracker task={task} />
                </form>

                {/* Footer */}
                <div style={{
                    padding: '24px',
                    borderTop: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    {task && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: `${colors.danger}20`,
                                border: `1px solid ${colors.danger}`,
                                borderRadius: '12px',
                                color: colors.danger,
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            color: colors.textMain,
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: colors.primary,
                            border: 'none',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {task ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
