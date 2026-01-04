import React, { useState } from 'react';
import RoadmapViewer from './RoadmapViewer';
import SidebarChat from './SidebarChat';
import TaskBoard from './TaskBoard';
import { LayoutDashboard, MessageSquare, ListChecks, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import ActivityFeed from './ActivityFeed';
import ProjectCreateModal from './ProjectCreateModal';

const ProjectWorkspace = ({ agents, tasks, projects = [], events, socket, onBack, refreshTasks, refreshProjects }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [subview, setSubview] = useState('roadmap'); // roadmap, tasks, activity
    const [selectedProjectId, setSelectedProjectId] = useState('all'); // 'all', 'unassigned', or project UUID
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    };

    // Determine the active project object for header info
    const activeProject = selectedProjectId !== 'all' && selectedProjectId !== 'unassigned'
        ? projects.find(p => p.id === selectedProjectId)
        : null;

    // Filter tasks based on selected project
    const projectTasks = tasks.filter(t => {
        if (selectedProjectId === 'all') return true;
        if (selectedProjectId === 'unassigned') return !t.projectId;
        return t.projectId === selectedProjectId;
    });

    const pmAgent = agents.find(a => a.role?.toLowerCase().includes('project manager') || a.name?.toLowerCase().includes('project manager'));

    const projectStats = {
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter(t => t.status === 'done' || t.status === 'completed').length,
        inProgress: projectTasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length,
        todo: projectTasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        activeAgents: new Set(projectTasks.map(t => t.assignedToId).filter(id => id)).size
    };

    const overallProgress = projectStats.totalTasks > 0
        ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)
        : 0;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: '24px' }}>
            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
                {/* Project Header Card */}
                <div style={{
                    padding: '32px',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${colors.card} 0%, #111 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: `radial-gradient(circle at 100% 0%, ${colors.primary}10 0%, transparent 70%)` }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '32px' }}>🛰️</span>
                                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>Projects</h2>
                            </div>

                            {/* Project Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: colors.primary,
                                        fontSize: '18px',
                                        fontWeight: 800,
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all" style={{ backgroundColor: colors.card }}>All Activity</option>
                                    <option value="unassigned" style={{ backgroundColor: colors.card }}>Unassigned Tasks</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id} style={{ backgroundColor: colors.card }}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => { refreshTasks?.(); refreshProjects?.(); }}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '6px',
                                        color: colors.textMuted,
                                        fontSize: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    REFRESH
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    style={{
                                        padding: '4px 12px',
                                        backgroundColor: colors.primary,
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#ffffff',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        marginLeft: '4px'
                                    }}
                                >
                                    NEW PROJECT
                                </button>
                            </div>

                            <p style={{ margin: 0, color: colors.textMuted, fontSize: '14px', maxWidth: '500px' }}>
                                {activeProject ? activeProject.description :
                                    selectedProjectId === 'unassigned' ? 'Tasks not yet associated with a specific project.' :
                                        'Real-time orchestration tracking and autonomous agent coordination.'}
                            </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '36px', fontWeight: 900, color: colors.primary }}>{overallProgress}%</div>
                            <div style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 800 }}>Project Completion</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px', position: 'relative', zIndex: 1 }}>
                        {[
                            { label: 'Completed', value: projectStats.completedTasks, icon: '✅', color: '#10b981' },
                            { label: 'In Progress', value: projectStats.inProgress, icon: '⚡', color: '#f59e0b' },
                            { label: 'To Do', value: projectStats.todo, icon: '📋', color: colors.textMuted },
                            { label: 'Agents Active', value: projectStats.activeAgents, icon: '🤖', color: '#8b5cf6' }
                        ].map((stat, i) => (
                            <div key={i} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '24px', fontWeight: 800 }}>{stat.value}</div>
                                <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main View Switcher */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {[
                        { id: 'roadmap', label: 'Dynamic Roadmap', icon: LayoutDashboard },
                        { id: 'tasks', label: 'Kanban Board', icon: ListChecks },
                        { id: 'activity', label: 'Activity Logs', icon: Activity }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubview(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                backgroundColor: subview === tab.id ? 'white' : 'transparent',
                                color: subview === tab.id ? 'black' : colors.textMuted,
                                border: `1px solid ${subview === tab.id ? 'white' : colors.border}`,
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sub-view Content */}
                <div style={{ flex: 1, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', overflowY: 'auto' }}>
                    {subview === 'roadmap' && <RoadmapViewer tasks={projectTasks} />}
                    {subview === 'tasks' && (
                        <div style={{ padding: '24px', height: '100%' }}>
                            <TaskBoard tasks={projectTasks} agents={agents} />
                        </div>
                    )}
                    {subview === 'activity' && (
                        <div style={{ height: '100%' }}>
                            <ActivityFeed socket={socket} events={events} />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Chat & Context */}
            <div style={{
                width: isSidebarOpen ? '400px' : '60px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: colors.card,
                borderLeft: `1px solid ${colors.border}`,
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0
            }}>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '20px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {isSidebarOpen ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '32px 24px 24px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                👔
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Project Manager</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Orchestration Lead</p>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            {pmAgent ? (
                                <SidebarChat agent={pmAgent} socket={socket} projectId={selectedProjectId} />
                            ) : (
                                <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
                                    Project Manager not found.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{ fontSize: '20px', opacity: 0.5 }}>👔</div>
                        <div style={{ fontSize: '20px', opacity: 0.5 }}>📊</div>
                    </div>
                )}
            </div>
            <ProjectCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={(newProject) => {
                    refreshProjects?.();
                    setSelectedProjectId(newProject.id);
                }}
            />
        </div>
    );
};

export default ProjectWorkspace;
