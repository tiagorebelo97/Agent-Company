import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
const socket = io(API_URL);

const AgentCompanyDashboard = () => {
    const [activeView, setActiveView] = useState('dashboard'); // dashboard, agents, tasks, kanban, chat, projects
    const [activeAgent, setActiveAgent] = useState(null);
    const [selectedChatAgent, setSelectedChatAgent] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [smartChatMessages, setSmartChatMessages] = useState([]);
    const [smartMessageInput, setSmartMessageInput] = useState('');
    const [autoSelectedAgent, setAutoSelectedAgent] = useState(null);
    const [realAgents, setRealAgents] = useState([]);

    // ALL 31 AGENTS
    const initialAgents = [
        // Management (1)
        { id: 'pm', name: 'Project Manager', role: 'Task Orchestration', status: 'Active', color: '#8b5cf6', load: 45, emoji: '🎯', skills: ['Task Decomposition', 'Priority Management', 'Timeline Tracking'], category: 'management' },

        // Design & UX (2)
        { id: 'design', name: 'Design Agent', role: 'UI/UX & Aesthetics', status: 'Active', color: '#2B81FF', load: 12, emoji: '🎨', skills: ['Figma Integration', 'Component Design', 'Design Systems'], category: 'design' },
        { id: 'accessibility', name: 'Accessibility Agent', role: 'WCAG Compliance', status: 'Idle', color: '#3b82f6', load: 0, emoji: '♿', skills: ['ARIA Labels', 'Screen Readers', 'Keyboard Nav'], category: 'design' },

        // Development (7 - now includes Architecture Agent!)
        { id: 'frontend', name: 'Frontend Engineer', role: 'React & UI Implementation', status: 'Active', color: '#06b6d4', load: 54, emoji: '💻', skills: ['React', 'State Management', 'Performance'], category: 'development' },
        { id: 'backend', name: 'Backend Engineer', role: 'API & Server Logic', status: 'Active', color: '#10b981', load: 67, emoji: '⚙️', skills: ['REST APIs', 'Database Design', 'Authentication'], category: 'development' },
        { id: 'architecture', name: 'Architecture Agent', role: 'Microservices & System Design', status: 'Active', color: '#7c3aed', load: 38, emoji: '🏗️', skills: ['Microservices', 'Service Mesh', 'Event-Driven Architecture', 'DDD', 'Kubernetes'], category: 'development' },
        { id: 'mobile', name: 'Mobile Agent', role: 'iOS/Android Development', status: 'Idle', color: '#a855f7', load: 0, emoji: '📱', skills: ['React Native', 'Mobile UI', 'App Store'], category: 'development' },
        { id: 'db', name: 'Database Architect', role: 'Schema & Optimization', status: 'Idle', color: '#a855f7', load: 0, emoji: '🗄️', skills: ['PostgreSQL', 'Migrations', 'Query Optimization'], category: 'development' },
        { id: 'performance', name: 'Performance Agent', role: 'Optimization & Profiling', status: 'Active', color: '#f97316', load: 42, emoji: '⚡', skills: ['Bundle Optimization', 'Lazy Loading', 'Caching'], category: 'development' },
        { id: 'ecommerce', name: 'E-commerce Agent', role: 'Shopping & Payments', status: 'Idle', color: '#10b981', load: 0, emoji: '🛒', skills: ['Stripe', 'Inventory', 'Orders'], category: 'development' },

        // Quality & Security (4)
        { id: 'qa', name: 'QA/Testing Agent', role: 'Quality Assurance', status: 'Active', color: '#14b8a6', load: 38, emoji: '✅', skills: ['Jest', 'Playwright', 'Accessibility'], category: 'quality' },
        { id: 'review', name: 'Code Review Agent', role: 'Code Quality & Security', status: 'Active', color: '#f43f5e', load: 22, emoji: '👁️', skills: ['Security Audits', 'Performance', 'Best Practices'], category: 'quality' },
        { id: 'security', name: 'Security Agent', role: 'Security & Compliance', status: 'Active', color: '#dc2626', load: 28, emoji: '🔒', skills: ['Vulnerability Scanning', 'Penetration Testing', 'OWASP'], category: 'quality' },
        { id: 'monitoring', name: 'Monitoring Agent', role: 'System Monitoring', status: 'Active', color: '#14b8a6', load: 65, emoji: '👀', skills: ['Metrics', 'Alerting', 'Incident Response'], category: 'quality' },

        // DevOps & Infrastructure (3)
        { id: 'devops', name: 'DevOps Agent', role: 'CI/CD & Infrastructure', status: 'Idle', color: '#ec4899', load: 0, emoji: '🚀', skills: ['Docker', 'GitHub Actions', 'AWS'], category: 'devops' },
        { id: 'backup', name: 'Backup & Recovery Agent', role: 'Data Protection', status: 'Active', color: '#6366f1', load: 12, emoji: '💾', skills: ['Backups', 'Disaster Recovery', 'Versioning'], category: 'devops' },
        { id: 'cost', name: 'Cost Optimization Agent', role: 'Cloud Cost Management', status: 'Idle', color: '#eab308', load: 0, emoji: '💰', skills: ['Cost Analysis', 'Resource Optimization', 'Budgeting'], category: 'devops' },

        // Research & Analysis (3)
        { id: 'research', name: 'Research Agent', role: 'Technology Research', status: 'Active', color: '#f59e0b', load: 85, emoji: '🔍', skills: ['Web Search', 'Documentation', 'Best Practices'], category: 'research' },
        { id: 'analyst', name: 'Project Analyst', role: 'Codebase Analysis', status: 'Active', color: '#7c3aed', load: 52, emoji: '🔬', skills: ['Architecture Review', 'Dependency Mapping', 'Code Complexity'], category: 'research' },
        { id: 'datascience', name: 'Data Science Agent', role: 'ML & Analytics', status: 'Idle', color: '#8b5cf6', load: 0, emoji: '📊', skills: ['Data Analysis', 'ML Models', 'Predictions'], category: 'research' },

        // Content & Communication (5)
        { id: 'docs', name: 'Documentation Agent', role: 'Technical Writing', status: 'Active', color: '#6366f1', load: 15, emoji: '📚', skills: ['API Docs', 'Tutorials', 'README'], category: 'content' },
        { id: 'content', name: 'Content Writer Agent', role: 'Content Creation', status: 'Active', color: '#84cc16', load: 18, emoji: '✍️', skills: ['Blog Posts', 'SEO Writing', 'Copywriting'], category: 'content' },
        { id: 'seo', name: 'SEO/Marketing Agent', role: 'SEO & Content Strategy', status: 'Idle', color: '#22c55e', load: 0, emoji: '📈', skills: ['Keyword Research', 'Meta Tags', 'Analytics'], category: 'content' },
        { id: 'social', name: 'Social Media Agent', role: 'Social Management', status: 'Idle', color: '#ec4899', load: 0, emoji: '📱', skills: ['Content Scheduling', 'Engagement', 'Analytics'], category: 'content' },
        { id: 'email', name: 'Email Agent', role: 'Email Campaigns', status: 'Idle', color: '#3b82f6', load: 0, emoji: '📧', skills: ['Templates', 'Deliverability', 'A/B Testing'], category: 'content' },

        // AI & Automation (4)
        { id: 'nlp', name: 'NLP Agent', role: 'Natural Language Processing', status: 'Idle', color: '#06b6d4', load: 0, emoji: '💬', skills: ['Sentiment Analysis', 'Chatbots', 'Translation'], category: 'ai' },
        { id: 'scheduler', name: 'Scheduler Agent', role: 'Task Scheduling', status: 'Active', color: '#8b5cf6', load: 8, emoji: '⏰', skills: ['Cron Jobs', 'Reminders', 'Automation'], category: 'ai' },
        { id: 'integration', name: 'Integration Agent', role: 'API Integration', status: 'Idle', color: '#ec4899', load: 0, emoji: '🔌', skills: ['Webhooks', 'Third-party APIs', 'Zapier'], category: 'ai' },
        { id: 'translation', name: 'Translation Agent', role: 'Internationalization', status: 'Idle', color: '#84cc16', load: 0, emoji: '🌍', skills: ['i18n', 'Localization', 'Multi-language'], category: 'ai' },

        // User Experience (3)
        { id: 'support', name: 'Support Agent', role: 'Customer Support', status: 'Active', color: '#f59e0b', load: 33, emoji: '🆘', skills: ['Ticket Management', 'FAQ', 'Live Chat'], category: 'ux' },
        { id: 'onboarding', name: 'Onboarding Agent', role: 'User Onboarding', status: 'Idle', color: '#06b6d4', load: 0, emoji: '🎓', skills: ['Tutorials', 'Walkthroughs', 'Activation'], category: 'ux' },
        { id: 'media', name: 'Video/Media Agent', role: 'Media Processing', status: 'Idle', color: '#f43f5e', load: 0, emoji: '🎥', skills: ['Video Editing', 'Image Processing', 'Compression'], category: 'ux' },
    ];

    const [agents, setAgents] = useState(initialAgents);

    const agentCategories = [
        { id: 'management', name: 'Management', emoji: '🎯', color: '#8b5cf6' },
        { id: 'design', name: 'Design & UX', emoji: '🎨', color: '#2B81FF' },
        { id: 'development', name: 'Development', emoji: '💻', color: '#06b6d4' },
        { id: 'quality', name: 'Quality & Security', emoji: '🔒', color: '#dc2626' },
        { id: 'devops', name: 'DevOps & Infrastructure', emoji: '🚀', color: '#ec4899' },
        { id: 'research', name: 'Research & Analysis', emoji: '🔍', color: '#f59e0b' },
        { id: 'content', name: 'Content & Communication', emoji: '✍️', color: '#84cc16' },
        { id: 'ai', name: 'AI & Automation', emoji: '🤖', color: '#8b5cf6' },
        { id: 'ux', name: 'User Experience', emoji: '👥', color: '#f59e0b' },
    ];

    const [tasks, setTasks] = useState([
        { id: 1, title: 'Design authentication UI', assignedTo: 'design', status: 'In Progress', priority: 'High', progress: 75 },
        { id: 2, title: 'Build auth API endpoints', assignedTo: 'backend', status: 'In Progress', priority: 'High', progress: 60 },
        { id: 3, title: 'Research best auth libraries', assignedTo: 'research', status: 'Complete', priority: 'Medium', progress: 100 },
        { id: 4, title: 'Setup CI/CD pipeline', assignedTo: 'devops', status: 'Pending', priority: 'Low', progress: 0 },
        { id: 5, title: 'Write E2E tests for login', assignedTo: 'qa', status: 'Pending', priority: 'Medium', progress: 0 },
    ]);

    // WebSocket & API Integration
    useEffect(() => {
        // Fetch initial agents
        fetch(`${API_URL}/api/agents`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    updateAgentsFromReal(data.agents);
                }
            })
            .catch(err => console.error('Failed to fetch agents:', err));

        // WebSocket listeners
        socket.on('agents:initial', (data) => updateAgentsFromReal(data));
        socket.on('agent:registered', (data) => updateAgentsFromReal([data]));
        socket.on('agent:task:start', (data) => {
            console.log('Task started:', data);
            // Update agent load or task status
        });
        socket.on('agent:task:complete', (data) => {
            console.log('Task complete:', data);
        });

        return () => {
            socket.off('agents:initial');
            socket.off('agent:registered');
            socket.off('agent:task:start');
            socket.off('agent:task:complete');
        };
    }, []);

    const updateAgentsFromReal = (realData) => {
        setAgents(prev => {
            const newAgents = [...prev];
            realData.forEach(real => {
                const index = newAgents.findIndex(a => a.id === real.id);
                if (index !== -1) {
                    // Update existing agent with real data
                    newAgents[index] = { ...newAgents[index], ...real, isReal: true };
                }
            });
            return newAgents;
        });
    };

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() && uploadedFiles.length === 0 || !selectedChatAgent) return;

        const newMessage = {
            id: Date.now(),
            sender: 'user',
            text: messageInput,
            timestamp: new Date().toLocaleTimeString(),
            files: uploadedFiles.length > 0 ? [...uploadedFiles] : null
        };

        setChatMessages([...chatMessages, newMessage]);
        setMessageInput('');
        setUploadedFiles([]);

        // Send to real agent if active/real
        const agent = agents.find(a => a.id === selectedChatAgent.id);

        if (agent && agent.isReal) {
            fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageInput, agentId: agent.id })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const agentResponse = {
                            id: Date.now() + 1,
                            sender: agent.id,
                            text: data.response.acknowledged ? `Acknowledged! I'm working on it.` : data.response.message,
                            timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, agentResponse]);
                    }
                })
                .catch(err => console.error('Chat error:', err));
        } else {
            // Simulate agent response for mock agents
            setTimeout(() => {
                const agentResponse = {
                    id: Date.now() + 1,
                    sender: selectedChatAgent.id,
                    text: uploadedFiles.length > 0
                        ? `I received your ${uploadedFiles.length} file(s). Let me analyze them and get back to you!`
                        : `I'm ${selectedChatAgent.name}. I received your message and I'm working on it!`,
                    timestamp: new Date().toLocaleTimeString()
                };
                setChatMessages(prev => [...prev, agentResponse]);
            }, 1000);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, type: f.type }))]);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Smart Agent Selection - Detects intent and auto-selects agent
    const detectAgent = (message) => {
        const msg = message.toLowerCase();

        // Design keywords
        if (msg.includes('design') || msg.includes('ui') || msg.includes('ux') || msg.includes('mockup') || msg.includes('figma')) {
            return agents.find(a => a.id === 'design');
        }
        // Architecture keywords (NEW!)
        if (msg.includes('microservice') || msg.includes('architecture') || msg.includes('service mesh') || msg.includes('kubernetes') || msg.includes('distributed') || msg.includes('event-driven')) {
            return agents.find(a => a.id === 'architecture');
        }
        // Code/Development keywords
        if (msg.includes('code') || msg.includes('implement') || msg.includes('build') || msg.includes('develop')) {
            if (msg.includes('api') || msg.includes('backend') || msg.includes('server')) {
                return agents.find(a => a.id === 'backend');
            }
            return agents.find(a => a.id === 'frontend');
        }
        // Security keywords
        if (msg.includes('secure') || msg.includes('security') || msg.includes('vulnerability') || msg.includes('hack')) {
            return agents.find(a => a.id === 'security');
        }
        // Testing keywords
        if (msg.includes('test') || msg.includes('qa') || msg.includes('bug')) {
            return agents.find(a => a.id === 'qa');
        }
        // Deploy keywords
        if (msg.includes('deploy') || msg.includes('ci/cd') || msg.includes('docker')) {
            return agents.find(a => a.id === 'devops');
        }
        // Analysis keywords
        if (msg.includes('analyze') || msg.includes('analysis') || msg.includes('review')) {
            return agents.find(a => a.id === 'analyst');
        }
        // Research keywords
        if (msg.includes('research') || msg.includes('find') || msg.includes('search') || msg.includes('how to')) {
            return agents.find(a => a.id === 'research');
        }
        // Documentation keywords
        if (msg.includes('document') || msg.includes('readme') || msg.includes('docs')) {
            return agents.find(a => a.id === 'docs');
        }

        // Default to Project Manager for general queries
        return agents.find(a => a.id === 'pm');
    };

    const handleSmartChatSend = () => {
        if (!smartMessageInput.trim()) return;

        // User message
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: smartMessageInput,
            timestamp: new Date().toLocaleTimeString()
        };

        // Detect which agent should respond
        const selectedAgent = detectAgent(smartMessageInput);
        setAutoSelectedAgent(selectedAgent);

        // Routing message
        const routingMessage = {
            id: Date.now() + 1,
            sender: 'system',
            text: `🤖 Routing to: ${selectedAgent.emoji} ${selectedAgent.name}`,
            timestamp: new Date().toLocaleTimeString(),
            isRouting: true
        };

        setSmartChatMessages([...smartChatMessages, userMessage, routingMessage]);
        setSmartMessageInput('');

        // Real Agent routing
        if (selectedAgent && selectedAgent.isReal) {
            fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: smartMessageInput, agentId: selectedAgent.id })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const agentResponse = {
                            id: Date.now() + 2,
                            sender: selectedAgent.id,
                            agentName: selectedAgent.name,
                            agentEmoji: selectedAgent.emoji,
                            text: data.response.acknowledged ? `I'm on it! I've started processing your request.` : data.response.message,
                            timestamp: new Date().toLocaleTimeString()
                        };
                        setSmartChatMessages(prev => [...prev, agentResponse]);
                    }
                })
                .catch(err => console.error('Smart Chat error:', err));
        } else {
            // Simulate agent response for mock agents
            setTimeout(() => {
                const agentResponse = {
                    id: Date.now() + 2,
                    sender: selectedAgent.id,
                    agentName: selectedAgent.name,
                    agentEmoji: selectedAgent.emoji,
                    text: `I'm ${selectedAgent.name} (Simulation). I'll help you with that!`,
                    timestamp: new Date().toLocaleTimeString()
                };
                setSmartChatMessages(prev => [...prev, agentResponse]);
            }, 1000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.bg, color: 'white', fontFamily: 'Inter, sans-serif', display: 'flex' }}>

            {/* Sidebar Navigation */}
            <div style={{ width: '280px', backgroundColor: colors.card, borderRight: `1px solid ${colors.border}`, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '24px' }}>🏢</div>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, textTransform: 'uppercase' }}>Agent Company</h1>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Control Plane</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
                        { id: 'agents', label: 'Agents', emoji: '🤖' },
                        { id: 'tasks', label: 'Tasks', emoji: '📋' },
                        { id: 'kanban', label: 'Kanban', emoji: '📌' },
                        { id: 'smartchat', label: 'Smart Chat', emoji: '🧠' },
                        { id: 'chat', label: 'Agent Chat', emoji: '💬' },
                        { id: 'projects', label: 'Projects', emoji: '📁' },
                        { id: 'analytics', label: 'Analytics', emoji: '📈' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            style={{
                                padding: '14px 20px',
                                backgroundColor: activeView === item.id ? 'white' : 'transparent',
                                color: activeView === item.id ? 'black' : colors.textMuted,
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: activeView === item.id ? 700 : 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: '20px', backgroundColor: '#000', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>System Status</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>● All Systems Online</div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '8px' }}>{agents.length} Agents Active</div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>

                {/* Dashboard View */}
                {activeView === 'dashboard' && (
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '32px' }}>Agent Workforce Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {agents.map(agent => (
                                <div
                                    key={agent.id}
                                    onClick={() => setActiveAgent(agent)}
                                    style={{
                                        backgroundColor: colors.card,
                                        border: `1px solid ${activeAgent?.id === agent.id ? colors.primary : colors.border}`,
                                        borderRadius: '24px',
                                        padding: '28px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        transform: activeAgent?.id === agent.id ? 'translateY(-4px)' : 'none',
                                        boxShadow: activeAgent?.id === agent.id ? `0 20px 40px ${colors.primary}20` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            background: `${agent.color}15`,
                                            border: `1px solid ${agent.color}30`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>
                                            {agent.emoji}
                                        </div>
                                        <div style={{
                                            padding: '6px 14px',
                                            borderRadius: '100px',
                                            background: agent.status === 'Active' ? '#10b98115' : '#ffffff05',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            color: agent.status === 'Active' ? '#10b981' : '#666',
                                            textTransform: 'uppercase'
                                        }}>
                                            {agent.status}
                                        </div>
                                    </div>

                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700 }}>{agent.name}</h3>
                                    <p style={{ margin: '0 0 20px 0', color: colors.textMuted, fontSize: '12px' }}>{agent.role}</p>

                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted }}>
                                            <span>Load</span>
                                            <span>{agent.load}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${agent.load}%`, height: '100%', background: agent.color, boxShadow: `0 0 10px ${agent.color}` }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {agent.skills.slice(0, 2).map((skill, i) => (
                                            <span key={i} style={{ fontSize: '9px', padding: '4px 8px', background: '#ffffff08', borderRadius: '6px', color: colors.textMuted }}>{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Agents View - Organized by Categories */}
                {activeView === 'agents' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 8px 0' }}>Agent Management</h2>
                                <p style={{ margin: 0, color: colors.textMuted, fontSize: '14px' }}>{agents.length} agents across {agentCategories.length} categories</p>
                            </div>
                            <button style={{ padding: '14px 24px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                + Deploy New Agent
                            </button>
                        </div>

                        {/* Categories */}
                        <div style={{ display: 'grid', gap: '32px' }}>
                            {agentCategories.map(category => {
                                const categoryAgents = agents.filter(a => a.category === category.id);

                                return (
                                    <div key={category.id}>
                                        {/* Category Header */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: `2px solid ${category.color}30`
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: `${category.color}15`,
                                                border: `1px solid ${category.color}30`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px'
                                            }}>
                                                {category.emoji}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: category.color }}>{category.name}</h3>
                                                <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>{categoryAgents.length} agent{categoryAgents.length !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        {/* Category Agents */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                            {categoryAgents.map(agent => (
                                                <div key={agent.id} style={{
                                                    backgroundColor: colors.card,
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '16px',
                                                    padding: '20px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.borderColor = `${agent.color}50`;
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.borderColor = colors.border;
                                                    }}
                                                >
                                                    {/* Agent Header */}
                                                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                                                        <div style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '12px',
                                                            background: `${agent.color}15`,
                                                            border: `1px solid ${agent.color}30`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '24px',
                                                            flexShrink: 0
                                                        }}>
                                                            {agent.emoji}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>{agent.name}</h4>
                                                            <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.role}</p>
                                                        </div>
                                                        <span style={{
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            background: agent.status === 'Active' ? '#10b98115' : '#ffffff05',
                                                            fontSize: '9px',
                                                            fontWeight: 800,
                                                            color: agent.status === 'Active' ? '#10b981' : '#666',
                                                            textTransform: 'uppercase',
                                                            flexShrink: 0
                                                        }}>
                                                            {agent.status}
                                                        </span>
                                                    </div>

                                                    {/* Skills */}
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            {agent.skills.slice(0, 3).map((skill, i) => (
                                                                <span key={i} style={{
                                                                    fontSize: '10px',
                                                                    padding: '4px 8px',
                                                                    background: `${agent.color}10`,
                                                                    border: `1px solid ${agent.color}20`,
                                                                    borderRadius: '6px',
                                                                    color: agent.color,
                                                                    fontWeight: 600
                                                                }}>
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {agent.skills.length > 3 && (
                                                                <span style={{ fontSize: '10px', padding: '4px 8px', color: colors.textMuted }}>
                                                                    +{agent.skills.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Load Bar */}
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted }}>
                                                            <span>Load</span>
                                                            <span>{agent.load}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${agent.load}%`, height: '100%', background: agent.color, boxShadow: `0 0 8px ${agent.color}`, transition: 'width 0.5s ease' }} />
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => {
                                                                setActiveView('chat');
                                                                setSelectedChatAgent(agent);
                                                                setChatMessages([]);
                                                            }}
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px 12px',
                                                                backgroundColor: agent.color,
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                fontSize: '11px'
                                                            }}
                                                        >
                                                            💬 Chat
                                                        </button>
                                                        <button style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: 'transparent',
                                                            color: colors.textMuted,
                                                            border: `1px solid ${colors.border}`,
                                                            borderRadius: '8px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '11px'
                                                        }}>
                                                            ⚙️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tasks View */}
                {activeView === 'tasks' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>Task Queue</h2>
                            <button style={{ padding: '14px 24px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                + New Task
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            {tasks.map(task => {
                                const agent = agents.find(a => a.id === task.assignedTo);
                                return (
                                    <div key={task.id} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700 }}>{task.title}</h3>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: colors.textMuted }}>Assigned to:</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontSize: '16px' }}>{agent.emoji}</span>
                                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{agent.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '10px',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    background: task.priority === 'High' ? '#f43f5e20' : task.priority === 'Medium' ? '#f59e0b20' : '#ffffff08',
                                                    color: task.priority === 'High' ? '#f43f5e' : task.priority === 'Medium' ? '#f59e0b' : colors.textMuted
                                                }}>
                                                    {task.priority}
                                                </span>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '10px',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    background: task.status === 'Complete' ? '#10b98120' : task.status === 'In Progress' ? '#2B81FF20' : '#ffffff08',
                                                    color: task.status === 'Complete' ? '#10b981' : task.status === 'In Progress' ? '#2B81FF' : colors.textMuted
                                                }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${task.progress}%`, height: '100%', background: task.status === 'Complete' ? '#10b981' : colors.primary }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Kanban Board View */}
                {activeView === 'kanban' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>Kanban Board</h2>
                            <button style={{ padding: '14px 24px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                                + New Task
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                            {[
                                { id: 'backlog', title: 'Backlog', color: '#6b7280' },
                                { id: 'todo', title: 'To Do', color: '#3b82f6' },
                                { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
                                { id: 'review', title: 'Review', color: '#8b5cf6' },
                                { id: 'done', title: 'Done', color: '#10b981' },
                            ].map(column => {
                                const columnTasks = tasks.filter(t => {
                                    if (column.id === 'backlog') return t.status === 'Backlog';
                                    if (column.id === 'todo') return t.status === 'To Do' || t.status === 'Pending';
                                    if (column.id === 'in-progress') return t.status === 'In Progress';
                                    if (column.id === 'review') return t.status === 'In Review';
                                    if (column.id === 'done') return t.status === 'Done' || t.status === 'Complete';
                                    return false;
                                });

                                return (
                                    <div key={column.id} style={{ minWidth: '320px', backgroundColor: colors.card, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: column.color }} />
                                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{column.title}</h3>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted }}>{columnTasks.length}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
                                            {columnTasks.map(task => {
                                                const agent = agents.find(a => a.id === task.assignedTo);
                                                return (
                                                    <div key={task.id} style={{
                                                        backgroundColor: '#000',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '16px',
                                                        padding: '16px',
                                                        cursor: 'grab',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '9px',
                                                                fontWeight: 800,
                                                                textTransform: 'uppercase',
                                                                background: task.priority === 'High' ? '#f43f5e20' : task.priority === 'Medium' ? '#f59e0b20' : '#ffffff08',
                                                                color: task.priority === 'High' ? '#f43f5e' : task.priority === 'Medium' ? '#f59e0b' : colors.textMuted
                                                            }}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, lineHeight: '1.4' }}>{task.title}</h4>

                                                        {task.progress > 0 && (
                                                            <div style={{ marginBottom: '12px' }}>
                                                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${task.progress}%`, height: '100%', background: column.color }} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '8px',
                                                                background: `${agent.color}15`,
                                                                border: `1px solid ${agent.color}30`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '12px'
                                                            }}>
                                                                {agent.emoji}
                                                            </div>
                                                            <span style={{ fontSize: '11px', color: colors.textMuted }}>{agent.name}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {columnTasks.length === 0 && (
                                                <div style={{
                                                    padding: '40px 20px',
                                                    textAlign: 'center',
                                                    color: colors.textMuted,
                                                    fontSize: '12px',
                                                    border: `1px dashed ${colors.border}`,
                                                    borderRadius: '12px'
                                                }}>
                                                    No tasks
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Smart Chat View - Auto Agent Selection */}
                {activeView === 'smartchat' && (
                    <div>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Smart Chat 🧠</h2>
                            <p style={{ color: colors.textMuted, fontSize: '14px' }}>Just talk naturally - the system will automatically route to the right agent(s)</p>
                        </div>

                        <div style={{ backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column' }}>
                            {/* Messages */}
                            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {smartChatMessages.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '100px' }}>
                                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧠</div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>Smart Chat Ready</h3>
                                        <p style={{ margin: 0, fontSize: '14px' }}>Ask anything and I'll route you to the right agent automatically</p>
                                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ fontSize: '12px', color: colors.textMuted }}>Try saying:</div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {[
                                                    '"Design a login page"',
                                                    '"Build an API"',
                                                    '"Is this code secure?"',
                                                    '"Analyze this project"'
                                                ].map((example, i) => (
                                                    <span key={i} style={{ padding: '6px 12px', background: '#ffffff08', borderRadius: '8px', fontSize: '11px' }}>{example}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    smartChatMessages.map(msg => {
                                        if (msg.isRouting) {
                                            // Routing message
                                            return (
                                                <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <div style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '100px',
                                                        backgroundColor: '#ffffff08',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        color: colors.primary
                                                    }}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (msg.sender === 'user') {
                                            // User message
                                            return (
                                                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <div style={{
                                                        maxWidth: '70%',
                                                        padding: '14px 18px',
                                                        borderRadius: '16px',
                                                        backgroundColor: colors.primary,
                                                        color: 'white'
                                                    }}>
                                                        <div style={{ fontSize: '14px', marginBottom: '6px' }}>{msg.text}</div>
                                                        <div style={{ fontSize: '10px', color: '#ffffff80' }}>{msg.timestamp}</div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Agent message
                                        const agent = agents.find(a => a.id === msg.sender);
                                        return (
                                            <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '12px',
                                                    background: `${agent.color}15`,
                                                    border: `1px solid ${agent.color}30`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    flexShrink: 0
                                                }}>
                                                    {msg.agentEmoji}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: agent.color }}>{msg.agentName}</div>
                                                    <div style={{
                                                        padding: '14px 18px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#ffffff10',
                                                        color: 'white'
                                                    }}>
                                                        <div style={{ fontSize: '14px', marginBottom: '6px' }}>{msg.text}</div>
                                                        <div style={{ fontSize: '10px', color: colors.textMuted }}>{msg.timestamp}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input */}
                            <div style={{ padding: '24px', borderTop: `1px solid ${colors.border}` }}>
                                {/* File Preview */}
                                {uploadedFiles.length > 0 && (
                                    <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {uploadedFiles.map((file, i) => (
                                            <div key={i} style={{ padding: '8px 12px', background: '#ffffff10', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📎 {file.name}</span>
                                                <button onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: '0 4px' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                        id="smart-chat-file-upload"
                                    />
                                    <label
                                        htmlFor="smart-chat-file-upload"
                                        style={{
                                            padding: '14px',
                                            backgroundColor: '#ffffff10',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff15'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff10'}
                                    >
                                        📎
                                    </label>
                                    <input
                                        type="text"
                                        value={smartMessageInput}
                                        onChange={(e) => setSmartMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSmartChatSend()}
                                        placeholder="Ask anything... (e.g., 'Design a dashboard', 'Build auth API', 'Is this secure?')"
                                        style={{
                                            flex: 1,
                                            padding: '14px 20px',
                                            backgroundColor: '#000',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleSmartChatSend}
                                        style={{
                                            padding: '14px 28px',
                                            backgroundColor: colors.primary,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Agent Chat View */}
                {activeView === 'chat' && (
                    <div style={{ height: 'calc(100vh - 96px)', display: 'flex', gap: '24px' }}>
                        {/* Agent List */}
                        <div style={{ width: '320px', backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, padding: '24px', overflowY: 'auto' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textMuted }}>Select Agent</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {agents.map(agent => (
                                    <div
                                        key={agent.id}
                                        onClick={() => {
                                            setSelectedChatAgent(agent);
                                            setChatMessages([]);
                                        }}
                                        style={{
                                            padding: '16px',
                                            backgroundColor: selectedChatAgent?.id === agent.id ? '#ffffff10' : 'transparent',
                                            border: `1px solid ${selectedChatAgent?.id === agent.id ? agent.color : 'transparent'}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <span style={{ fontSize: '24px' }}>{agent.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{agent.name}</div>
                                            <div style={{ fontSize: '10px', color: colors.textMuted }}>{agent.role}</div>
                                        </div>
                                        {agent.status === 'Active' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div style={{ flex: 1, backgroundColor: colors.card, borderRadius: '24px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
                            {selectedChatAgent ? (
                                <>
                                    {/* Chat Header */}
                                    <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            background: `${selectedChatAgent.color}15`,
                                            border: `1px solid ${selectedChatAgent.color}30`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>
                                            {selectedChatAgent.emoji}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{selectedChatAgent.name}</h3>
                                            <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>{selectedChatAgent.role}</p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {chatMessages.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '100px' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{selectedChatAgent.emoji}</div>
                                                <p>Start a conversation with {selectedChatAgent.name}</p>
                                            </div>
                                        ) : (
                                            chatMessages.map(msg => (
                                                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{
                                                        maxWidth: '70%',
                                                        padding: '14px 18px',
                                                        borderRadius: '16px',
                                                        backgroundColor: msg.sender === 'user' ? colors.primary : '#ffffff10',
                                                        color: 'white'
                                                    }}>
                                                        <div style={{ fontSize: '14px', marginBottom: '6px' }}>{msg.text}</div>
                                                        <div style={{ fontSize: '10px', color: msg.sender === 'user' ? '#ffffff80' : colors.textMuted }}>{msg.timestamp}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Input */}
                                    <div style={{ padding: '24px', borderTop: `1px solid ${colors.border}` }}>
                                        {/* File Preview */}
                                        {uploadedFiles.length > 0 && (
                                            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} style={{
                                                        padding: '8px 12px',
                                                        backgroundColor: '#ffffff10',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '12px'
                                                    }}>
                                                        <span>📎 {file.name}</span>
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#f43f5e',
                                                                cursor: 'pointer',
                                                                padding: '0 4px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                style={{
                                                    padding: '14px',
                                                    backgroundColor: '#ffffff10',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '18px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff15'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff10'}
                                            >
                                                📎
                                            </label>
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder={`Message ${selectedChatAgent.name}...`}
                                                style={{
                                                    flex: 1,
                                                    padding: '14px 20px',
                                                    backgroundColor: '#000',
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                style={{
                                                    padding: '14px 28px',
                                                    backgroundColor: colors.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                                        <p>Select an agent to start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects View */}
                {activeView === 'projects' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>GitHub Repositories</h2>
                            <button style={{ padding: '14px 24px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>🔗</span> Connect Repository
                            </button>
                        </div>

                        {/* Unified Project Card - Repository + Lifecycle */}
                        <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px' }}>
                            {/* Project Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #2B81FF 0%, #7c3aed 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>
                                            📦
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>tiagorebelo97/Agent-Company</h3>
                                            <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '13px' }}>Autonomous agent workforce management system</p>
                                        </div>
                                        <span style={{ padding: '4px 12px', borderRadius: '100px', background: '#10b98115', fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginLeft: '12px' }}>
                                            ● Connected
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: colors.textMuted, marginTop: '12px' }}>
                                        <span>⭐ 24 stars</span>
                                        <span>🔀 3 forks</span>
                                        <span>📝 12 open issues</span>
                                        <span>🌿 main branch</span>
                                    </div>
                                </div>
                                <button style={{ padding: '10px 20px', backgroundColor: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
                                    ⚙️ Settings
                                </button>
                            </div>

                            {/* Quick Links */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>🔗 Quick Links</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    {[
                                        { label: 'GitHub Repo', icon: '🔗', url: 'https://github.com/tiagorebelo97/Agent-Company' },
                                        { label: 'Sandbox Preview', icon: '🎨', url: 'http://localhost:5173' },
                                        { label: 'Live App', icon: '🌐', url: '#' },
                                        { label: 'Documentation', icon: '📚', url: '#' },
                                    ].map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '12px 16px',
                                                backgroundColor: '#000',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                textDecoration: 'none',
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ffffff10';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#000';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <span style={{ fontSize: '18px' }}>{link.icon}</span>
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Git Operations */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>🔄 Git Operations</div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Pull', icon: '⬇️', color: '#3b82f6' },
                                        { label: 'Push', icon: '⬆️', color: '#10b981' },
                                        { label: 'Branch', icon: '🌿', color: '#f59e0b' },
                                        { label: 'History', icon: '📜', color: '#8b5cf6' },
                                    ].map((btn, i) => (
                                        <button
                                            key={i}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: `${btn.color}15`,
                                                border: `1px solid ${btn.color}30`,
                                                borderRadius: '10px',
                                                color: btn.color,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <span>{btn.icon}</span>
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Build & Deploy */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>🚀 Build & Deploy</div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Build', icon: '🔨', color: '#f59e0b' },
                                        { label: 'Test', icon: '✅', color: '#14b8a6' },
                                        { label: 'Deploy', icon: '🚀', color: '#ec4899' },
                                        { label: 'Rollback', icon: '⏪', color: '#f43f5e' },
                                    ].map((btn, i) => (
                                        <button
                                            key={i}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: `${btn.color}15`,
                                                border: `1px solid ${btn.color}30`,
                                                borderRadius: '10px',
                                                color: btn.color,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <span>{btn.icon}</span>
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Launch Controls */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>▶️ Launch Controls</div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Start', icon: '▶️', color: '#10b981' },
                                        { label: 'Stop', icon: '⏹️', color: '#f43f5e' },
                                        { label: 'Restart', icon: '🔄', color: '#f59e0b' },
                                        { label: 'Logs', icon: '📋', color: '#6366f1' },
                                    ].map((btn, i) => (
                                        <button
                                            key={i}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: `${btn.color}15`,
                                                border: `1px solid ${btn.color}30`,
                                                borderRadius: '10px',
                                                color: btn.color,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <span>{btn.icon}</span>
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Agents on this Project */}
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>🤖 Agents Working on This Project</div>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[agents[1], agents[3], agents[4], agents[6]].map(agent => (
                                        <div key={agent.id} style={{
                                            padding: '8px 16px',
                                            background: `${agent.color}15`,
                                            border: `1px solid ${agent.color}30`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600
                                        }}>
                                            <span style={{ fontSize: '16px' }}>{agent.emoji}</span>
                                            <span style={{ color: agent.color }}>{agent.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics View */}
                {activeView === 'analytics' && (
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '32px' }}>Performance Analytics</h2>
                        <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: '100px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📈</div>
                            <p>Analytics dashboard coming soon...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AgentCompanyDashboard;
