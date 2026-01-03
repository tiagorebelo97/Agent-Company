import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AgentChatModal from './AgentChatModal';

const AgentMatrix = ({ agents, socket }) => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Track loading state
    useEffect(() => {
        if (agents && agents.length > 0) {
            // Small delay to show loading state
            setTimeout(() => setIsLoading(false), 300);
        }
    }, [agents]);

    const categories = ['all', ...new Set(agents.map(a => a.category))];

    const filteredAgents = agents.filter(agent => {
        const matchesFilter = filter === 'all' || agent.category === filter;
        const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
            agent.role.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const colors = {
        bg: '#000000',
        card: '#0a0a0a',
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF'
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Controls Skeleton */}
                <div style={{
                    padding: '24px',
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '24px'
                }}>
                    <div style={{
                        height: '40px',
                        width: '300px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        marginBottom: '16px'
                    }} />
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                style={{
                                    height: '40px',
                                    width: '100px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            style={{
                                padding: '28px',
                                backgroundColor: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '24px',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                animationDelay: `${i * 0.1}s`
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.05)'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        height: '18px',
                                        width: '70%',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        marginBottom: '10px'
                                    }} />
                                    <div style={{
                                        height: '14px',
                                        width: '50%',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
                                {[1, 2, 3].map(j => (
                                    <div
                                        key={j}
                                        style={{
                                            height: '24px',
                                            width: `${60 + j * 20}px`,
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Controls */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px',
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '24px'
            }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: colors.textMuted,
                        width: '18px',
                        height: '18px'
                    }} />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 48px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            color: colors.textMain,
                            fontSize: '13px',
                            fontWeight: 500,
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                transition: 'all 0.2s ease',
                                backgroundColor: filter === cat ? 'white' : 'rgba(255,255,255,0.05)',
                                color: filter === cat ? 'black' : colors.textMuted,
                                border: filter === cat ? 'none' : `1px solid ${colors.border}`,
                                cursor: 'pointer',
                                boxShadow: filter === cat ? '0 0 20px rgba(255,255,255,0.2)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {filteredAgents.length === 0 ? (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '64px 16px',
                        color: colors.textMuted
                    }}>
                        <p style={{ fontSize: '14px', fontWeight: 600 }}>No agents found</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>Try adjusting your search or filter</p>
                    </div>
                ) : (
                    filteredAgents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => {
                                setSelectedAgent(agent);
                                setIsChatOpen(true);
                            }}
                            style={{
                                position: 'relative',
                                padding: '28px',
                                backgroundColor: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = `${colors.primary}50`;
                                e.currentTarget.style.boxShadow = `0 20px 40px ${colors.primary}20`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = colors.border;
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Status Indicator */}
                            <div style={{
                                position: 'absolute',
                                top: '28px',
                                right: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: agent.status === 'online' ? '#10b981' :
                                        agent.status === 'error' ? '#ef4444' : colors.textMuted,
                                    boxShadow: agent.status === 'online' ? '0 0 12px rgba(16,185,129,0.5)' : 'none'
                                }} />
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: agent.status === 'online' ? '#10b981' :
                                        agent.status === 'error' ? '#ef4444' : colors.textMuted
                                }}>
                                    {agent.status || 'idle'}
                                </span>
                            </div>

                            {/* Agent Info */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', paddingRight: '70px' }}>
                                {/* Emoji Icon */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    backgroundColor: `${agent.color}15`,
                                    border: `2px solid ${agent.color}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    flexShrink: 0
                                }}>
                                    {agent.emoji || '🤖'}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        color: colors.textMain,
                                        marginBottom: '6px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {agent.name}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        color: colors.textMuted,
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {agent.role}
                                    </p>
                                </div>
                            </div>

                            {/* Skills */}
                            {agent.skills && agent.skills.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {agent.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: '8px',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                color: colors.textMuted,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {agent.skills.length > 3 && (
                                        <span style={{
                                            padding: '6px 12px',
                                            backgroundColor: `${colors.primary}15`,
                                            border: `1px solid ${colors.primary}30`,
                                            borderRadius: '8px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            color: colors.primary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            +{agent.skills.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Agent Chat Modal */}
            {selectedAgent && (
                <AgentChatModal
                    agent={selectedAgent}
                    isOpen={isChatOpen}
                    onClose={() => {
                        setIsChatOpen(false);
                        setSelectedAgent(null);
                    }}
                    socket={socket}
                />
            )}
        </div>
    );
};

export default AgentMatrix;
