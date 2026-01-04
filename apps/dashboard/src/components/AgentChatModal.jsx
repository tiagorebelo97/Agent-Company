import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Zap, HelpCircle, Activity } from 'lucide-react';

const AgentChatModal = ({ agent, isOpen, onClose, socket }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [interactiveState, setInteractiveState] = useState({}); // { msgId: { items: [] } }
    const [confirmedMessages, setConfirmedMessages] = useState(new Set());
    const messagesEndRef = useRef(null);

    const colors = {
        bg: '#0a0a0f',
        bgSecondary: '#12121a',
        border: 'rgba(255,255,255,0.1)',
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        textMain: '#e5e7eb',
        textSecondary: '#9ca3af',
        userBubble: '#6366f1',
        agentBubble: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b'
    };

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation history when modal opens
    useEffect(() => {
        if (isOpen && agent) {
            loadChatHistory();
        }
    }, [isOpen, agent]);

    // WebSocket listeners
    useEffect(() => {
        if (!socket || !agent) return;

        const handleAgentMessage = (data) => {
            if (data.agentId === agent.id) {
                const messageData = typeof data.message === 'object' ? data.message.text : data.message;
                const interactiveData = typeof data.message === 'object' ? data.message.interactive : null;

                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'agent',
                    message: messageData,
                    interactive: interactiveData,
                    timestamp: new Date(),
                    metadata: data.metadata
                }]);
                setIsTyping(false);
            }
        };

        const handleAgentTyping = (data) => {
            if (data.agentId === agent.id) {
                setIsTyping(data.isTyping);
            }
        };

        socket.on('agent:message', handleAgentMessage);
        socket.on('agent:typing', handleAgentTyping);

        return () => {
            socket.off('agent:message', handleAgentMessage);
            socket.off('agent:typing', handleAgentTyping);
        };
    }, [socket, agent]);

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/agents/${agent.id}/chat/history`);
            if (response.ok) {
                const data = await response.json();
                const parsedMessages = (data.messages || []).map(msg => {
                    let content = msg.content || msg.message;
                    let interactive = null;

                    if (typeof content === 'string' && content.startsWith('{')) {
                        try {
                            const parsed = JSON.parse(content);
                            content = parsed.text;
                            interactive = parsed.interactive;
                        } catch (e) {
                            // Not JSON or invalid, keep as is
                        }
                    }

                    return {
                        ...msg,
                        message: content,
                        interactive: interactive,
                        sender: msg.fromId === 'user' ? 'user' : 'agent'
                    };
                });
                setMessages(parsedMessages);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const sendMessage = async (message = inputMessage, taskId = null) => {
        if (!message.trim() || isSending) return;

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            message: message.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsSending(true);
        setIsTyping(true);

        try {
            console.log('Sending message to agent:', agent.id, message.trim(), taskId);
            const response = await fetch(`http://localhost:3001/api/agents/${agent.id}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.trim(), taskId })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            console.log('Response data:', data);

            // Agent response will come via WebSocket only
            // Don't add it here to avoid duplicates

        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'system',
                message: 'Failed to send message. Please try again.',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInteractiveChange = (msgId, itemId, field, value) => {
        setInteractiveState(prev => {
            const current = prev[msgId] || { items: messages.find(m => m.id === msgId)?.interactive?.items || [] };
            const newItems = current.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            );
            return { ...prev, [msgId]: { items: newItems } };
        });
    };

    const confirmInteraction = (msgId) => {
        let state = interactiveState[msgId];

        // If no changes were made, state might be undefined.
        // Get it from the message itself.
        if (!state) {
            const msg = messages.find(m => m.id === msgId);
            if (msg && msg.interactive && msg.interactive.items) {
                state = { items: msg.interactive.items };
            }
        }

        if (!state) return;

        const selectedItems = state.items.filter(i => i.selected);
        const resultString = selectedItems.map(i => `- ${i.label}${i.note ? ` (${i.note})` : ''}`).join('\n');

        sendMessage(`Confirmado:\n${resultString}`, msgId);

        // Mark as confirmed in UI
        setConfirmedMessages(prev => new Set([...prev, msgId]));
    };

    const renderInteractiveContent = (msg) => {
        const state = interactiveState[msg.id] || { items: msg.interactive.items || [] };
        const isConfirmed = confirmedMessages.has(msg.id);

        if (msg.interactive.type === 'selection_list') {
            return (
                <div style={{
                    marginTop: '16px',
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: '16px',
                    opacity: isConfirmed ? 0.7 : 1,
                    pointerEvents: isConfirmed ? 'none' : 'auto'
                }}>
                    <p style={{ fontWeight: 600, marginBottom: '12px', color: colors.primary }}>
                        {msg.interactive.title} {isConfirmed && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Confirmado</span>}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {state.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={item.selected}
                                        onChange={(e) => handleInteractiveChange(msg.id, item.id, 'selected', e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                                </div>
                                {item.selected && (
                                    <input
                                        type="text"
                                        placeholder="Acrescentar mais detalhes..."
                                        value={item.note || ''}
                                        onChange={(e) => handleInteractiveChange(msg.id, item.id, 'note', e.target.value)}
                                        style={{
                                            marginLeft: '28px',
                                            padding: '6px 10px',
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '6px',
                                            color: colors.textMain,
                                            fontSize: '12px',
                                            outline: 'none'
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {!isConfirmed && (
                        <button
                            onClick={() => confirmInteraction(msg.id)}
                            style={{
                                marginTop: '16px',
                                width: '100%',
                                padding: '10px',
                                backgroundColor: colors.primary,
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Confirmar Seleção
                        </button>
                    )}
                </div>
            );
        }
        return null;
    };

    const quickActions = [
        {
            icon: Zap,
            label: 'Execute Task',
            message: 'Execute task: '
        },
        {
            icon: HelpCircle,
            label: 'Ask Question',
            message: 'What is your current status?'
        },
        {
            icon: Activity,
            label: 'Get Status',
            action: () => sendMessage('What are you working on right now?')
        }
    ];

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '800px',
                    height: '80vh',
                    maxHeight: '700px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px',
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: `linear-gradient(135deg, ${colors.bgSecondary} 0%, ${colors.bg} 100%)`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#fff'
                            }}
                        >
                            {agent.name.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: colors.textMain }}>
                                {agent.name}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: agent.status === 'idle' ? colors.success :
                                            agent.status === 'busy' ? colors.warning :
                                                colors.textSecondary
                                    }}
                                />
                                <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                                    {agent.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: colors.textSecondary,
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                            e.target.style.color = colors.textMain;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = colors.textSecondary;
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Quick Actions */}
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto'
                    }}
                >
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (action.action) {
                                    action.action();
                                } else {
                                    setInputMessage(action.message);
                                }
                            }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: colors.bgSecondary,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = colors.primary;
                                e.target.style.borderColor = colors.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = colors.bgSecondary;
                                e.target.style.borderColor = colors.border;
                            }}
                        >
                            <action.icon size={16} />
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}
                >
                    {messages.length === 0 ? (
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.textSecondary,
                                textAlign: 'center'
                            }}
                        >
                            <HelpCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p style={{ fontSize: '16px', margin: 0 }}>
                                Start a conversation with {agent.name}
                            </p>
                            <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>
                                Ask questions, execute tasks, or get status updates
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '4px'
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        backgroundColor: msg.sender === 'user' ? colors.userBubble :
                                            msg.sender === 'system' ? 'rgba(239, 68, 68, 0.1)' :
                                                colors.agentBubble,
                                        color: colors.textMain,
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div>{msg.message}</div>

                                    {/* Render Interactive Content if present */}
                                    {msg.interactive && renderInteractiveContent(msg)}

                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: colors.textSecondary,
                                            marginTop: '8px',
                                            opacity: 0.7,
                                            textAlign: msg.sender === 'user' ? 'right' : 'left'
                                        }}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    backgroundColor: colors.agentBubble,
                                    display: 'flex',
                                    gap: '4px'
                                }}
                            >
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: colors.textSecondary,
                                        animation: 'typing 1.4s infinite'
                                    }}
                                />
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: colors.textSecondary,
                                        animation: 'typing 1.4s infinite 0.2s'
                                    }}
                                />
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: colors.textSecondary,
                                        animation: 'typing 1.4s infinite 0.4s'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                    style={{
                        padding: '24px',
                        borderTop: `1px solid ${colors.border}`,
                        backgroundColor: colors.bgSecondary
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-end'
                        }}
                    >
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${agent.name}...`}
                            disabled={isSending}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                backgroundColor: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textMain,
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'none',
                                minHeight: '48px',
                                maxHeight: '120px',
                                outline: 'none'
                            }}
                            rows={1}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!inputMessage.trim() || isSending}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: inputMessage.trim() && !isSending ? colors.primary : colors.bgSecondary,
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: inputMessage.trim() && !isSending ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                opacity: inputMessage.trim() && !isSending ? 1 : 0.5
                            }}
                        >
                            <Send size={16} />
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Typing Animation CSS */}
            <style>{`
                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.7;
                    }
                    30% {
                        transform: translateY(-10px);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default AgentChatModal;
