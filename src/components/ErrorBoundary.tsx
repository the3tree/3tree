/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * Production-ready error handling with graceful fallback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // Log error to monitoring service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        // In production, send to error tracking service
        // e.g., Sentry.captureException(error, { extra: errorInfo });
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-gray-500 mb-6">
                            We're sorry, but something unexpected happened. Our team has been notified.
                        </p>

                        {/* Error details (development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
                                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleRetry}
                                className="btn-icy"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={this.handleGoHome}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </div>

                        {/* Support link */}
                        <p className="mt-6 text-sm text-gray-400">
                            Need help?{' '}
                            <a
                                href="/contact"
                                className="text-cyan-600 hover:underline inline-flex items-center gap-1"
                            >
                                <MessageCircle className="w-3 h-3" />
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

/**
 * Functional wrapper for ErrorBoundary with error logging
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

/**
 * Simple error fallback component
 */
export function ErrorFallback({
    error,
    resetError
}: {
    error?: Error;
    resetError?: () => void;
}) {
    return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-red-800 mb-2">Something went wrong</h3>
            <p className="text-red-600 text-sm mb-4">
                {error?.message || 'An unexpected error occurred'}
            </p>
            {resetError && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={resetError}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                </Button>
            )}
        </div>
    );
}
