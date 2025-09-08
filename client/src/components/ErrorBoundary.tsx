import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import ModernButton from './ui/ModernButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                We encountered an unexpected error while loading this page.
              </p>
              <p className="text-gray-500">
                Don't worry, our team has been notified and we're working to fix it.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <ModernButton
                onClick={this.handleReload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </ModernButton>
              
              <ModernButton
                onClick={this.handleGoHome}
                variant="bordered"
                className="px-8 py-3 text-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </ModernButton>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-6 bg-gray-100 rounded-lg text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Error Details (Development Only)
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Error Message:</h4>
                    <pre className="text-sm text-red-600 bg-red-50 p-3 rounded overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Stack Trace:</h4>
                    <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Component Stack:</h4>
                      <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Information */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                If this error persists, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ModernButton
                  onClick={() => window.open('mailto:support@safarbot.com', '_blank')}
                  variant="bordered"
                  className="flex items-center justify-center"
                >
                  Contact Support
                </ModernButton>
                <ModernButton
                  onClick={() => window.open('https://github.com/safarbot/issues', '_blank')}
                  variant="bordered"
                  className="flex items-center justify-center"
                >
                  Report Issue
                </ModernButton>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-8 text-gray-500 text-sm">
              <p>
                Error Code: 500 | 
                Timestamp: {new Date().toISOString()}
              </p>
              <p className="mt-2">
                SafarBot - Your AI Travel Companion
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;