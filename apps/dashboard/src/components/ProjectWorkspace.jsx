import React, { useState, useEffect } from 'react';
import RoadmapViewer from './RoadmapViewer';
import SidebarChat from './SidebarChat';
import TaskBoard from './TaskBoard';
import {
    LayoutDashboard,
    MessageSquare,
    ListChecks,
    Activity,
    ChevronRight,
    ChevronLeft,
    FolderTree,
    Cpu,
    GitBranch,
    Download,
    Upload,
    BarChart3,
    FileCode,
    Settings,
    Plus
} from 'lucide-react';
import ActivityFeed from './ActivityFeed';
import ProjectCreateModal from './ProjectCreateModal';
import ProjectFileExplorer from './ProjectFileExplorer';
import ProjectAnalysisDashboard from './ProjectAnalysisDashboard';

const ProjectWorkspace = ({ agents, tasks, projects = [], events, socket, onBack, refreshTasks, refreshProjects }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [view, setView] = useState('overview'); // overview, explorer, analysis, tasks, activity
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF',
        success: '#10b981',
        github: '#24292e'
    };

    // Determine the active project
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

    const handleDeleteProject = async () => {
        if (!activeProject) return;
        if (!window.confirm(`Are you sure you want to delete project "${activeProject.name}"? This will remove all associated tasks and data.`)) return;

        try {
            const response = await fetch(`http://localhost:3001/api/projects/${activeProject.id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                refreshProjects?.();
                setSelectedProjectId('all');
            } else {
                alert('Failed to delete project: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project. See console.');
        }
    };

    const navigationItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'explorer', label: 'File Explorer', icon: FolderTree },
        { id: 'analysis', label: 'AI Analysis', icon: Cpu },
        { id: 'tasks', label: 'Kanban Board', icon: ListChecks },
        { id: 'activity', label: 'Activity Feed', icon: Activity },
    ];

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', backgroundColor: colors.bg, gap: '0' }}>
            {/* Left Workspace Sidebar */}
            <div style={{
                width: '280px',
                borderRight: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#050505'
            }}>
                {/* Project Selector Header */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                        }}>🛸</div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Workspace</h2>
                    </div>

                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            color: colors.textMain,
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238A8A8A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center'
                        }}
                    >
                        <option value="all" style={{ backgroundColor: '#111' }}>All Projects</option>
                        <option value="unassigned" style={{ backgroundColor: '#111' }}>Unassigned</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id} style={{ backgroundColor: '#111' }}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    {activeProject && (
                        <button
                            onClick={handleDeleteProject}
                            style={{
                                marginTop: '12px',
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            DELETE PROJECT
                        </button>
                    )}
                </div>

                {/* Nav Menu */}
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navigationItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                backgroundColor: view === item.id ? 'rgba(43, 129, 255, 0.1)' : 'transparent',
                                color: view === item.id ? colors.primary : colors.textMuted,
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}` }}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: colors.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={16} />
                        NEW PROJECT
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Hub Header */}
                <div style={{
                    height: '80px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    backgroundColor: '#030303'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                            {activeProject ? activeProject.name : 'Unified Dashboard'}
                        </h1>
                        {activeProject && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: colors.textMuted }}>
                                <GitBranch size={14} />
                                <span style={{ fontWeight: 700 }}>main</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => { refreshTasks?.(); refreshProjects?.(); }} style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: 'none', color: colors.textMuted, cursor: 'pointer' }}>
                            <Activity size={18} />
                        </button>

                        {activeProject?.repoUrl && (
                            <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                <button title="Pull Changes" style={{ padding: '8px 12px', background: 'none', border: 'none', color: colors.textMain, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                                    <Download size={14} /> PULL
                                </button>
                                <button title="Push Changes" style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', color: colors.textMain, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                                    <Upload size={14} /> PUSH
                                </button>
                            </div>
                        )}

                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#111', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings size={18} color={colors.textMuted} />
                        </div>
                    </div>
                </div>

                {/* View Container */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {view === 'overview' && (
                        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Roadmap / Stats Section */}
                            <RoadmapViewer tasks={projectTasks} />
                        </div>
                    )}

                    {view === 'explorer' && (
                        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <ProjectFileExplorer projectId={selectedProjectId} />
                        </div>
                    )}

                    {view === 'analysis' && (
                        <div style={{ height: '100%' }}>
                            <ProjectAnalysisDashboard
                                project={activeProject}
                                agents={agents}
                                isTaskInProgress={tasks.some(t => t.projectId === selectedProjectId && t.type === 'project_analysis' && (t.status === 'in_progress' || t.status === 'pending'))}
                            />
                        </div>
                    )}

                    {view === 'tasks' && (
                        <div style={{ padding: '32px', height: '100%' }}>
                            <TaskBoard tasks={projectTasks} agents={agents} />
                        </div>
                    )}

                    {view === 'activity' && (
                        <div style={{ height: '100%' }}>
                            <ActivityFeed socket={socket} events={events} />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Context Sidebar (Project Manager Chat) */}
            <div style={{
                width: isSidebarOpen ? '420px' : '0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: '#050505',
                borderLeft: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        👔
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Command Liaison</h3>
                        <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Project Manager (Orchestrator)</p>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {pmAgent ? (
                        <SidebarChat agent={pmAgent} socket={socket} projectId={selectedProjectId === 'all' ? null : selectedProjectId} />
                    ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
                            Orchestrator not found in swarm.
                        </div>
                    )}
                </div>
            </div>

            {/* Float toggle for right sidebar */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'absolute',
                    right: isSidebarOpen ? '435px' : '15px',
                    top: '100px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    color: colors.textMain,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100,
                    transition: 'all 0.3s'
                }}
            >
                {isSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <ProjectCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={(newProject) => {
                    refreshProjects?.();
                    setSelectedProjectId(newProject.id);
                    setView('overview');
                }}
            />
        </div>
    );
};

export default ProjectWorkspace;
