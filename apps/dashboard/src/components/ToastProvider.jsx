import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    const colors = {
        success: { bg: '#10b981', border: '#059669', icon: CheckCircle },
        error: { bg: '#ef4444', border: '#dc2626', icon: AlertCircle },
        warning: { bg: '#f59e0b', border: '#d97706', icon: AlertTriangle },
        info: { bg: '#2B81FF', border: '#1d6fe0', icon: Info }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px'
        }}>
            {toasts.map(toast => {
                const config = colors[toast.type] || colors.info;
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        style={{
                            backgroundColor: '#0a0a0a',
                            border: `2px solid ${config.bg}`,
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            animation: 'slideInRight 0.3s ease-out',
                            minWidth: '300px'
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: `${config.bg}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Icon size={16} color={config.bg} />
                        </div>

                        {/* Message */}
                        <div style={{
                            flex: 1,
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#ffffff',
                            lineHeight: '1.5'
                        }}>
                            {toast.message}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => onRemove(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#8A8A8A',
                                cursor: 'pointer',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#8A8A8A'}
                        >
                            <X size={18} />
                        </button>
                    </div>
                );
            })}

            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ToastProvider;
