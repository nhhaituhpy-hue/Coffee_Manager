import React, { ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly fallback UI
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to external error tracking service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error tracking service
    console.error('Error caught by boundary:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Example: Send to Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { errorInfo } } });
    // }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear problematic data if needed
    // localStorage.removeItem('problematic_key');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isRecurringError = this.state.errorCount > 3;

      return (
        <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-surface rounded-3xl shadow-2xl border border-outline-variant overflow-hidden">
              {/* Error Header */}
              <div className="bg-error/10 p-8 text-center space-y-4 border-b border-error/20">
                <div className="w-16 h-16 bg-error/20 text-error rounded-full mx-auto flex items-center justify-center">
                  <AlertCircle size={40} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-on-surface">Oops! Có lỗi xảy ra</h1>
                  <p className="text-on-surface-variant font-medium text-sm mt-2">
                    {isRecurringError
                      ? 'Lỗi liên tục xảy ra. Vui lòng thử làm mới trang.'
                      : 'Ứng dụng gặp sự cố. Chúng tôi đã ghi lại lỗi này.'}
                  </p>
                </div>
              </div>

              {/* Error Details */}
              <div className="p-6 space-y-4">
                {/* Development Error Info */}
                {isDevelopment && this.state.error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-on-surface/5 border border-outline rounded-lg p-4 space-y-2"
                  >
                    <p className="text-xs font-black text-outline uppercase tracking-widest">
                      Thông tin lỗi (Development)
                    </p>
                    <p className="text-xs font-mono text-error break-all">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <details className="text-xs font-mono text-on-surface-variant pt-2">
                        <summary className="cursor-pointer font-bold mb-2">Stack Trace</summary>
                        <pre className="bg-surface-container p-2 rounded overflow-auto max-h-40 text-[10px]">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </motion.div>
                )}

                {/* User-Friendly Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-secondary/10 border border-secondary/20 rounded-lg p-4"
                >
                  <p className="text-sm text-on-surface leading-relaxed">
                    {isRecurringError
                      ? 'Có vẻ như có vấn đề lâu dài. Vui lòng thử:'
                      : 'Cách khắc phục:'}
                  </p>
                  <ul className="text-sm text-on-surface-variant mt-3 space-y-1 ml-4 list-disc">
                    <li>Làm mới trang (F5)</li>
                    <li>Xóa bộ nhớ tạm của trình duyệt</li>
                    {isRecurringError && <li>Đăng nhập lại vào ứng dụng</li>}
                  </ul>
                </motion.div>

                {/* Error Reference */}
                <div className="text-center">
                  <p className="text-xs text-outline-variant">
                    Mã tham chiếu: {new Date().getTime().toString().slice(-6)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-surface-container border-t border-outline-variant flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Thử lại
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full py-3 bg-secondary text-white rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Làm mới trang
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full py-3 bg-surface border border-outline-variant text-on-surface rounded-lg font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  Về trang chủ
                </button>
              </div>

              {/* Support Info */}
              <div className="px-6 py-4 bg-surface-container/50 border-t border-outline-variant text-center">
                <p className="text-xs text-outline-variant">
                  Nếu lỗi vẫn tiếp tục, vui lòng liên hệ:
                  <a
                    href="mailto:nhhai.tuhpy@gmail.com"
                    className="text-primary font-bold hover:underline ml-1"
                  >
                    nhhai.tuhpy@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
