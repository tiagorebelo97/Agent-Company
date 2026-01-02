import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import io from 'socket.io-client';

const ConnectionStatus = ({ socket }) => {
    const [isConnected, setIsConnected] = useState(socket?.connected || false);
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            setIsConnected(true);
            setShowStatus(true);
            // Hide success message after 3 seconds
            setTimeout(() => setShowStatus(false), 3000);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            setShowStatus(true);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // Set initial state
        setIsConnected(socket.connected);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket]);

    // Don't show anything if connected and status is hidden
    if (isConnected && !showStatus) {
        return null;
    }

    const colors = {
        connected: {
            bg: '#10b981',
            border: '#059669',
            text: '#ffffff'
        },
        disconnected: {
            bg: '#ef4444',
            border: '#dc2626',
            text: '#ffffff'
        }
    };

    const config = isConnected ? colors.connected : colors.disconnected;
    const Icon = isConnected ? Wifi : WifiOff;
    const message = isConnected ? 'Connected' : 'Connection Lost - Reconnecting...';

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{
                backgroundColor: '#0a0a0a',
                border: `2px solid ${config.bg}`,
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                minWidth: '250px'
            }}>
                {/* Icon with pulse animation for disconnected */}
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: `${config.bg}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: !isConnected ? 'pulse 2s infinite' : 'none'
                }}>
                    <Icon size={16} color={config.bg} />
                </div>

                {/* Message */}
                <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: config.text
                }}>
                    {message}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateX(-50%) translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
};

export default ConnectionStatus;
