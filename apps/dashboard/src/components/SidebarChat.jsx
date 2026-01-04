import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, Loader2 } from 'lucide-react';

const SidebarChat = ({ agent, socket, projectId }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const colors = {
        primary: '#2B81FF',
        border: 'rgba(255,255,255,0.08)',
        textMuted: '#8A8A8A',
        agentBubble: 'rgba(255,255,255,0.03)',
        userBubble: '#2B81FF'
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (agent) {
            loadChatHistory();
        }
    }, [agent]);

    useEffect(() => {
        if (!socket || !agent) return;

        const handleAgentMessage = (data) => {
            if (data.agentId === agent.id) {
                const messageData = typeof data.message === 'object' ? data.message.text : data.message;
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'agent',
                    message: messageData,
                    timestamp: new Date()
                }]);
                setIsTyping(false);
            }
        };

        const handleTyping = (data) => {
            if (data.agentId === agent.id) {
                setIsTyping(data.isTyping);
            }
        };

        socket.on('agent:message', handleAgentMessage);
        socket.on('agent:typing', handleTyping);

        // Also listen for proactive chat messages
        socket.on('chat:response', (data) => {
            if (data.agentId === agent.id) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'agent',
                    message: data.response?.text || data.response,
                    timestamp: new Date()
                }]);
                setIsTyping(false);
            }
        });

        return () => {
            socket.off('agent:message', handleAgentMessage);
            socket.off('agent:typing', handleTyping);
            socket.off('chat:response');
        };
    }, [socket, agent]);

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/agents/${agent.id}/chat/history`);
            if (response.ok) {
                const data = await response.json();
                const parsed = (data.messages || []).map(msg => {
                    let text = msg.content || msg.message;
                    if (typeof text === 'string' && text.startsWith('{')) {
                        try {
                            text = JSON.parse(text).text;
                        } catch (e) { }
                    }
                    return {
                        id: msg.id,
                        sender: msg.role === 'user' ? 'user' : 'agent',
                        message: text,
                        timestamp: new Date(msg.createdAt)
                    };
                });
                setMessages(parsed);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isSending) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            message: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsSending(true);

        try {
            socket.emit('chat:message', {
                agentId: agent.id,
                projectId: projectId,
                message: inputMessage,
                history: messages.slice(-10).map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.message
                }))
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (!agent) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg, idx) => (
                    <div
                        key={msg.id || idx}
                        style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            backgroundColor: msg.sender === 'user' ? colors.userBubble : colors.agentBubble,
                            border: msg.sender === 'user' ? 'none' : `1px solid ${colors.border}`,
                            fontSize: '13px',
                            lineHeight: '1.5',
                            color: 'white',
                            boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(43,129,255,0.2)' : 'none'
                        }}
                    >
                        {msg.message}
                    </div>
                ))}

                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '16px', backgroundColor: colors.agentBubble, border: `1px solid ${colors.border}`, display: 'flex', gap: '4px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.textMuted, animation: 'pulse 1s infinite' }} />
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.textMuted, animation: 'pulse 1s infinite 0.2s' }} />
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.textMuted, animation: 'pulse 1s infinite 0.4s' }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}` }}>
                <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Message Project Manager..."
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isSending || !inputMessage.trim()}
                        style={{
                            padding: '12px',
                            backgroundColor: colors.primary,
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SidebarChat;
