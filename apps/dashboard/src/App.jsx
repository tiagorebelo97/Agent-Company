import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AgentMatrix from './components/AgentMatrix';
import ActivityFeed from './components/ActivityFeed';
import TaskBoard from './components/TaskBoard';
import ConnectionStatus from './components/ConnectionStatus';
import { ToastProvider } from './components/ToastProvider';
import { Users, ListTodo } from 'lucide-react';

const API_URL = 'http://localhost:3001';
const socket = io(API_URL);

function App() {
    const [agents, setAgents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_events');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [activeTab, setActiveTab] = useState('agents'); // 'agents' or 'tasks'

    const refreshTasks = () => {
        fetch(`${API_URL}/api/tasks`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Normalize tasks for UI
                    const normalizedTasks = data.tasks.map(t => ({
                        ...t,
                        status: t.status === 'completed' ? 'done' :
                            (t.status === 'todo' ? 'todo' : t.status)
                    }));
                    setTasks(normalizedTasks);
                }
            })
            .catch(err => console.error('Failed to fetch tasks:', err));
    };

    useEffect(() => {
        localStorage.setItem('dashboard_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        // Fetch initial agents
        fetch(`${API_URL}/api/agents`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAgents(data.agents);
                }
            })
            .catch(err => console.error('Failed to fetch agents:', err));

        // Fetch initial tasks
        refreshTasks();

        // --- Event Listeners for Persistence ---
        const handleEvent = (type, data, msgOverride) => {
            const newEvent = {
                id: Date.now() + Math.random(),
                type,
                timestamp: new Date(),
                agentId: data.agentId || data.from,
                agentName: data.agentName || data.fromName || data.from || data.agentId,
                message: msgOverride || data.message || data.content,
                data
            };
            setEvents(prev => [newEvent, ...prev].slice(0, 100));
        };

        socket.on('agents:initial', (data) => setAgents(data));
        socket.on('agent:registered', (agent) => {
            setAgents(prev => [...prev, agent]);
            handleEvent('system', {}, `New agent registered: ${agent.name}`);
        });

        socket.on('agent:status', (data) => {
            setAgents(prev => prev.map(a =>
                a.id === data.agentId ? { ...a, status: data.status } : a
            ));
            handleEvent('status', data, `Status changed to ${data.status}`);
        });

        // Task Events
        socket.on('task:created', (task) => {
            const normalized = { ...task, status: task.status === 'completed' ? 'done' : task.status };
            setTasks(prev => [normalized, ...prev]);
            handleEvent('task', { taskName: task.title, agentId: 'system' }, `New task created: ${task.title}`);
        });

        socket.on('task:updated', (task) => {
            const normalized = { ...task, status: task.status === 'completed' ? 'done' : task.status };
            setTasks(prev => prev.map(t => t.id === task.id ? normalized : t));
        });

        socket.on('task:status_changed', ({ taskId, status }) => {
            const uiStatus = status === 'completed' ? 'done' : status;
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: uiStatus } : t
            ));
            handleEvent('task', { taskName: 'Task', agentId: 'system' }, `Task status updated: ${status}`);
        });

        socket.on('task:deleted', ({ taskId }) => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
        });

        // Other Events
        socket.on('agent:message', (data) => handleEvent('message', data));
        socket.on('task:assigned', (data) => handleEvent('task', data, `Assigned task: ${data.taskName}`));
        socket.on('system:notification', (data) => handleEvent('system', data));
        socket.on('agent:registered', (data) => handleEvent('system', data, `New agent registered: ${data.name}`));


        return () => {
            socket.off('agents:initial');
            socket.off('agent:registered');
            socket.off('agent:status');
            socket.off('task:created');
            socket.off('task:updated');
            socket.off('task:status_changed');
            socket.off('task:deleted');
            socket.off('agent:message');
            socket.off('task:assigned');
            socket.off('system:notification');
            socket.off('agent:registered');
        };
    }, []);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    };

    return (
        <ToastProvider>
            <div style={{
                minHeight: '100vh',
                backgroundColor: colors.bg,
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                padding: '48px'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '32px' }}>🏢</div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: '32px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em'
                            }}>
                                Agent Company
                            </h1>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: colors.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 600
                            }}>
                                Control Plane
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div style={{
                    marginBottom: '32px',
                    padding: '24px',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '20px'
                }}>
                    <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 800 }}>
                        System Status
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'inline-block'
                        }} />
                        All Systems Online
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>
                        {agents.length} Agents Active
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '32px',
                    padding: '8px',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '16px',
                    width: 'fit-content'
                }}>
                    <button
                        onClick={() => setActiveTab('agents')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'agents' ? colors.primary : 'transparent',
                            color: activeTab === 'agents' ? '#ffffff' : colors.textMuted,
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Users size={18} />
                        Agents
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'tasks' ? colors.primary : 'transparent',
                            color: activeTab === 'tasks' ? '#ffffff' : colors.textMuted,
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <ListTodo size={18} />
                        Tasks
                    </button>
                </div>

                {/* Main Content */}
                {activeTab === 'agents' ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 400px',
                        gap: '32px',
                        minHeight: '600px'
                    }}>
                        {/* Agent Matrix */}
                        <div>
                            <AgentMatrix agents={agents} socket={socket} />
                        </div>

                        {/* Activity Feed */}
                        <div>
                            <ActivityFeed socket={socket} events={events} />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                        <TaskBoard agents={agents} tasks={tasks} onRefresh={refreshTasks} />
                        {/* Activity Feed Persisted on Tasks View as well */}
                        <div style={{
                            height: 'calc(100vh - 200px)',
                            position: 'sticky',
                            top: '20px'
                        }}>
                            <ActivityFeed socket={socket} events={events} />
                        </div>
                    </div>
                )}

                {/* Connection Status Indicator */}
                <ConnectionStatus socket={socket} />
            </div>
        </ToastProvider>
    );
}

export default App;
