import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

const RoadmapViewer = () => {
    const [activePhase, setActivePhase] = useState('foundation');

    const phases = [
        {
            id: 'foundation',
            name: 'Phase 1: Foundation',
            weeks: 'Weeks 1-2',
            status: 'in-progress',
            progress: 45,
            leads: ['Architecture Agent', 'Database Architect'],
            tasks: [
                { name: '32-agent swarm architecture', status: 'done' },
                { name: 'MCP integration', status: 'done' },
                { name: 'Python-Node.js bridge', status: 'done' },
                { name: 'Centralized state management', status: 'done' },
                { name: 'Event-driven messaging', status: 'done' },
                { name: 'Agent registry with monitoring', status: 'in-progress' },
            ]
        },
        {
            id: 'ux',
            name: 'Phase 2: User Experience',
            weeks: 'Weeks 2-3',
            status: 'in-progress',
            progress: 30,
            leads: ['Design Agent', 'Frontend Engineer'],
            tasks: [
                { name: 'Design system', status: 'done' },
                { name: 'Planning session component', status: 'done' },
                { name: 'Dashboard visualization', status: 'done' },
                { name: 'Agent Matrix implementation', status: 'in-progress' },
                { name: 'Kanban Board', status: 'todo' },
                { name: 'Real-time WebSocket', status: 'todo' },
            ]
        },
        {
            id: 'security',
            name: 'Phase 3: Security & Quality',
            weeks: 'Weeks 3-4',
            status: 'todo',
            progress: 10,
            leads: ['Security Agent', 'QA Agent'],
            tasks: [
                { name: 'Security audit', status: 'done' },
                { name: 'Authentication system', status: 'todo' },
                { name: 'Test suite', status: 'todo' },
                { name: 'CI/CD pipeline', status: 'todo' },
            ]
        },
        {
            id: 'devops',
            name: 'Phase 4: DevOps & Deployment',
            weeks: 'Week 4',
            status: 'todo',
            progress: 0,
            leads: ['DevOps Agent', 'Monitoring Agent'],
            tasks: [
                { name: 'Docker Compose setup', status: 'todo' },
                { name: 'GitHub Actions workflows', status: 'todo' },
                { name: 'Monitoring dashboards', status: 'todo' },
                { name: 'Alerting rules', status: 'todo' },
            ]
        },
    ];

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                        🚀
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Agent-Company Roadmap</h1>
                        <p className="text-slate-400">Multi-Agent Collaborative Planning</p>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-300 font-medium">Overall Progress</span>
                        <span className="text-2xl font-bold text-white">35%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" style={{ width: '35%' }} />
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-500">8</div>
                            <div className="text-xs text-slate-400">Completed</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-500">4</div>
                            <div className="text-xs text-slate-400">In Progress</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-400">14</div>
                            <div className="text-xs text-slate-400">To Do</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-500">32</div>
                            <div className="text-xs text-slate-400">Agents Active</div>
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
