import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

const RoadmapViewer = ({ tasks = [] }) => {
    const [phases, setPhases] = useState([]);

    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            setPhases([{
                id: 'waiting',
                name: 'Waiting for Project Initialization',
                weeks: '-',
                status: 'todo',
                progress: 0,
                leads: ['Project Manager'],
                tasks: [{ name: 'Initiate project via chat', status: 'todo' }]
            }]);
            return;
        }

        const dynamicPhases = [];
        const rootTasks = tasks.filter(t => !t.parentTaskId);

        rootTasks.forEach((root, idx) => {
            const subtasks = tasks.filter(t => t.parentTaskId === root.id);
            const total = subtasks.length;
            const completed = subtasks.filter(t => t.status === 'done' || t.status === 'completed').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : (root.status === 'done' ? 100 : 0);

            dynamicPhases.push({
                id: root.id,
                name: root.title || `Phase ${idx + 1}`,
                weeks: root.dueDate ? new Date(root.dueDate).toLocaleDateString() : 'Active',
                status: root.status === 'done' || root.status === 'completed' ? 'done' :
                    (root.status === 'in_progress' || root.status === 'in-progress' ? 'in-progress' : 'todo'),
                progress: progress,
                leads: [root.assignedToId || 'Agent'],
                tasks: subtasks.map(s => ({
                    name: s.title,
                    status: s.status === 'done' || s.status === 'completed' ? 'done' :
                        (s.status === 'in_progress' || s.status === 'in-progress' ? 'in-progress' : 'todo')
                }))
            });
        });

        if (dynamicPhases.length > 0) {
            setPhases(dynamicPhases);
        }
    }, [tasks]);

    const [activePhase, setActivePhase] = useState(null);

    useEffect(() => {
        if (phases.length > 0) {
            // If activePhase is null or not in the current phases, reset to first
            if (!activePhase || !phases.some(p => p.id === activePhase)) {
                setActivePhase(phases[0].id);
            }
        }
    }, [phases]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
            case 'todo':
                return <Circle className="w-5 h-5 text-slate-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'done':
                return 'bg-green-500';
            case 'in-progress':
                return 'bg-blue-500';
            case 'todo':
                return 'bg-slate-300';
            default:
                return 'bg-yellow-500';
        }
    };

    const stats = {
        completed: tasks.filter(t => t.status === 'done' || t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length,
        todo: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        activeAgents: new Set(tasks.map(t => t.assignedToId)).size
    };

    const totalTasks = tasks.length || 1;
    const overallProgress = Math.round((stats.completed / totalTasks) * 100);

    return (
        <div className="bg-slate-900/50 p-8 overflow-y-auto h-full">
            {/* Overall Progress Summary */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-300 font-medium">Overall Project Progress</span>
                        <span className="text-2xl font-bold text-white">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Completed</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">In Progress</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-400">{stats.todo}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">To Do</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-500">{stats.activeAgents}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Agents Involved</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {phases.map((phase) => (
                    <div
                        key={phase.id}
                        className={`bg-slate-800/50 backdrop-blur rounded-xl border transition-all duration-300 ${activePhase === phase.id
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'border-slate-700 hover:border-slate-600'
                            }`}
                        onClick={() => setActivePhase(phase.id)}
                    >
                        <div className="p-6">
                            {/* Phase Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{phase.name}</h3>
                                    <p className="text-sm text-slate-400">{phase.weeks}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${phase.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                    phase.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {phase.status.replace('-', ' ').toUpperCase()}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-400">Progress</span>
                                    <span className="text-sm font-bold text-white">{phase.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className={`${getStatusColor(phase.status)} h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${phase.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Lead Agents */}
                            <div className="mb-4">
                                <div className="text-xs text-slate-500 mb-2">Lead Agents</div>
                                <div className="flex flex-wrap gap-2">
                                    {phase.leads.map((lead) => (
                                        <span
                                            key={lead}
                                            className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                                        >
                                            {lead}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-2">
                                {phase.tasks.map((task, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                                    >
                                        {getStatusIcon(task.status)}
                                        <span className={`text-sm ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-300'
                                            }`}>
                                            {task.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Critical Actions */}
            <div className="max-w-7xl mx-auto mt-8">
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                        <h3 className="text-xl font-bold text-white">🔥 Critical Actions (Next 24h)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Database Foundation</div>
                            <div className="text-lg font-bold text-white">Database Architect</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Real-time Comms</div>
                            <div className="text-lg font-bold text-white">Backend Engineer</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Agent Matrix UI</div>
                            <div className="text-lg font-bold text-white">Frontend Engineer</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Task System</div>
                            <div className="text-lg font-bold text-white">Project Manager</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoadmapViewer;
