import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Search, Filter } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const TaskBoard = ({ agents, tasks: tasksProp, onRefresh }) => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [activeId, setActiveId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF',
        todo: '#6b7280',
        inProgress: '#3b82f6',
        review: '#f59e0b',
        done: '#10b981'
    };

    const columns = [
        { id: 'todo', title: 'To Do', color: colors.todo },
        { id: 'in_progress', title: 'In Progress', color: colors.inProgress },
        { id: 'review', title: 'Review', color: colors.review },
        { id: 'done', title: 'Done', color: colors.done }
    ];

    // Sync tasks from props or fetch if not provided
    useEffect(() => {
        if (tasksProp) {
            setTasks(tasksProp);
            setIsLoading(false);
        } else {
            fetchTasks();
        }
    }, [tasksProp]);

    // Filter tasks logic
    useEffect(() => {
        try {
            let filtered = tasks;

            if (filterStatus !== 'all') {
                filtered = filtered.filter(t => t.status === filterStatus);
            }

            if (filterPriority !== 'all') {
                filtered = filtered.filter(t => t.priority === filterPriority);
            }

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filtered = filtered.filter(t =>
                    (t.title && t.title.toLowerCase().includes(searchLower)) ||
                    (t.description && t.description.toLowerCase().includes(searchLower))
                );
            }

            setFilteredTasks(filtered);
        } catch (err) {
            console.error('Filtering failed:', err);
            setFilteredTasks(tasks);
        }
    }, [tasks, searchTerm, filterStatus, filterPriority]);

    // Internal fetch only used if tasksProp is missing
    // Internal fetch only used if tasksProp is missing
    const fetchTasks = async () => {
        if (onRefresh) {
            onRefresh();
            return;
        }

        if (tasksProp) return; // Prevent double fetch if prop exists but no refresh handler
        try {
            const response = await fetch('http://localhost:3001/api/tasks');
            const data = await response.json();
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const taskId = active.id;
        const newStatus = over.id;

        // Update task status
        if (newStatus && columns.some(c => c.id === newStatus)) {
            try {
                const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    console.error('Failed to update task status');
                }
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }

        setActiveId(null);
    };

    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const getTasksByStatus = (status) => {
        return filteredTasks.filter(t => t.status === status);
    };

    const activeTask = tasks.find(t => t.id === activeId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>


            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: 900,
                        color: colors.textMain
                    }}>
                        Task Board
                    </h2>
                    <button
                        onClick={handleCreateTask}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: colors.primary,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(43,129,255,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Plus size={18} />
                        New Task
                    </button>
                </div>

                {/* Search and Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                        <Search style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: colors.textMuted,
                            width: '16px',
                            height: '16px'
                        }} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            color: colors.textMain,
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    {columns.map(column => {
                        const columnTasks = getTasksByStatus(column.id);
                        return (
                            <div
                                key={column.id}
                                id={column.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Column Header */}
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderTop: `3px solid ${column.color}`,
                                    borderRadius: '16px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '14px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: column.color
                                        }}>
                                            {column.title}
                                        </h3>
                                        <span style={{
                                            padding: '4px 10px',
                                            backgroundColor: `${column.color}20`,
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: column.color
                                        }}>
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Tasks */}
                                <SortableContext
                                    items={columnTasks.map(t => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        flex: 1,
                                        overflowY: 'auto',
                                        padding: '4px'
                                    }}>
                                        {columnTasks.map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                agents={agents}
                                                onClick={() => handleEditTask(task)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskCard task={activeTask} agents={agents} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Modal */}
            {isModalOpen && (
                <TaskModal
                    task={selectedTask}
                    agents={agents}
                    onClose={handleCloseModal}
                    onSave={fetchTasks}
                />
            )}
        </div>
    );
};

export default TaskBoard;
