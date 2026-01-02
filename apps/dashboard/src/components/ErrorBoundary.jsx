import React from 'react';

/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You could also log to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            const colors = {
                bg: '#000000',
                card: '#0a0a0a',
                border: 'rgba(255,255,255,0.08)',
                textMain: '#ffffff',
                textMuted: '#8A8A8A',
                danger: '#ef4444',
                primary: '#2B81FF'
            };

            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: colors.bg,
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        width: '100%',
                        backgroundColor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '24px',
                        padding: '32px',
                        textAlign: 'center'
                    }}>
                        {/* Error Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            backgroundColor: `${colors.danger}20`,
                            border: `2px solid ${colors.danger}`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px'
                        }}>
                            ⚠️
                        </div>

                        {/* Title */}
                        <h1 style={{
                            margin: '0 0 16px 0',
                            fontSize: '24px',
                            fontWeight: 800,
                            color: colors.textMain
                        }}>
                            Oops! Something went wrong
                        </h1>

                        {/* Description */}
                        <p style={{
                            margin: '0 0 24px 0',
                            fontSize: '14px',
                            color: colors.textMuted,
                            lineHeight: '1.6'
                        }}>
                            The application encountered an unexpected error. Don't worry, this has been logged and we'll look into it.
                        </p>

                        {/* Error Details (Development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '24px',
                                textAlign: 'left',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                padding: '16px'
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: colors.textMain,
                                    marginBottom: '8px'
                                }}>
                                    Error Details (Development Only)
                                </summary>
                                <pre style={{
                                    margin: '8px 0 0 0',
                                    fontSize: '12px',
                                    color: colors.danger,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    fontFamily: 'monospace'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: colors.primary,
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(43,129,255,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    color: colors.textMain,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                }}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
