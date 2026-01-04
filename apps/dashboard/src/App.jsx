import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AgentMatrix from './components/AgentMatrix';
import ActivityFeed from './components/ActivityFeed';
import TaskBoard from './components/TaskBoard';
import ProjectWorkspace from './components/ProjectWorkspace';
import ConnectionStatus from './components/ConnectionStatus';
import { ToastProvider } from './components/ToastProvider';
import { Users, ListTodo, LayoutDashboard, Rocket, MessageSquare, BarChart3, Settings } from 'lucide-react';

const API_URL = 'http://localhost:3001';
const socket = io(API_URL);

function App() {
    const [agents, setAgents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_events');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [activeTab, setActiveTab] = useState('mission'); // default to mission control now

    const refreshTasks = () => {
        fetch(`${API_URL}/api/tasks`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
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

    const refreshProjects = () => {
        fetch(`${API_URL}/api/projects`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProjects(data.projects);
                }
            })
            .catch(err => console.error('Failed to fetch projects:', err));
    };

    useEffect(() => {
        localStorage.setItem('dashboard_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        fetch(`${API_URL}/api/agents`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setAgents(data.agents);
            });

        refreshProjects();
        refreshTasks();

        const handleEvent = (type, data, msgOverride) => {
            let messageContent = msgOverride || data.message || data.content;
            if (messageContent && typeof messageContent === 'object' && messageContent.text) {
                messageContent = messageContent.text;
            }

            const newEvent = {
                id: Date.now() + Math.random(),
                type,
                timestamp: new Date(),
                agentId: data.agentId || data.from,
                agentName: data.agentName || data.fromName || data.from || data.agentId,
                message: messageContent,
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

        socket.on('task:created', (task) => {
            const normalized = { ...task, status: task.status === 'completed' ? 'done' : task.status };
            setTasks(prev => [normalized, ...prev]);
            handleEvent('task', { taskName: task.title, agentId: 'system' }, `New task created: ${task.title}`);
            // Auto switch to mission control if it's an orchestration task
            if (!task.parentTaskId) setActiveTab('mission');
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

        socket.on('agent:message', (data) => handleEvent('message', data));
        socket.on('task:assigned', (data) => handleEvent('task', data, `Assigned task: ${data.taskName}`));

        socket.on('project:created', (project) => {
            setProjects(prev => [project, ...prev]);
            handleEvent('system', {}, `New project created: ${project.name}`);
        });

        socket.on('project:updated', (project) => {
            setProjects(prev => prev.map(p => p.id === project.id ? project : p));
        });

        socket.on('project:deleted', ({ id }) => {
            setProjects(prev => prev.filter(p => p.id !== id));
        });

        return () => {
            socket.off('agents:initial');
            socket.off('agent:registered');
            socket.off('agent:status');
            socket.off('task:created');
            socket.off('task:updated');
            socket.off('task:status_changed');
            socket.off('agent:message');
            socket.off('task:assigned');
            socket.off('project:created');
            socket.off('project:updated');
            socket.off('project:deleted');
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

    const navigation = [
        { id: 'mission', label: 'Projects', icon: Rocket, color: colors.primary },
        { id: 'agents', label: 'Agent Workforce', icon: Users, color: '#8b5cf6' },
        { id: 'tasks', label: 'Task Stream', icon: ListTodo, color: '#10b981' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, color: '#f59e0b' },
    ];

    return (
        <ToastProvider>
            <div style={{
                minHeight: '100vh',
                backgroundColor: colors.bg,
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                display: 'flex'
            }}>
                {/* Fixed Sidebar */}
                <div style={{
                    width: '300px',
                    height: '100vh',
                    backgroundColor: colors.card,
                    borderRight: `1px solid ${colors.border}`,
                    padding: '40px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0
                }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
                        <div style={{ fontSize: '32px' }}>🏢</div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Agent Company</h1>
                            <p style={{ margin: 0, fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Control Plane</p>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {navigation.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 20px',
                                    backgroundColor: activeTab === item.id ? `${item.color}15` : 'transparent',
                                    color: activeTab === item.id ? item.color : colors.textMuted,
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left'
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* System Guard */}
                    <div style={{ marginTop: 'auto', padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>Systems Operational</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>{agents.length} agents standing by.</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, padding: '40px 48px', overflowX: 'hidden' }}>

                    {activeTab === 'mission' && (
                        <ProjectWorkspace
                            agents={agents}
                            tasks={tasks}
                            projects={projects}
                            events={events}
                            socket={socket}
                            refreshTasks={refreshTasks}
                            refreshProjects={refreshProjects}
                        />
                    )}

                    {activeTab === 'agents' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                            <AgentMatrix agents={agents} socket={socket} />
                            <ActivityFeed socket={socket} events={events} />
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                            <TaskBoard agents={agents} tasks={tasks} onRefresh={refreshTasks} />
                            <ActivityFeed socket={socket} events={events} />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: colors.textMuted }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📊</div>
                            <h2>Workforce Analytics</h2>
                            <p>Real-time performance metrics and token usage monitoring across the swarm.</p>
                        </div>
                    )}
                </div>

                <ConnectionStatus socket={socket} />
            </div>
        </ToastProvider>
    );
}

export default App;
