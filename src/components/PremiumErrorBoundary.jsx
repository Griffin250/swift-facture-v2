import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class PremiumErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Premium feature error:', error, errorInfo);
    
    // Log error to your error reporting service here
    // Example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Premium Feature Error
              </h2>
              
              <Alert className="text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  There was an error loading the premium subscription features. 
                  This might be a temporary issue with our billing system.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left text-xs text-gray-600 dark:text-gray-400">
                <summary className="cursor-pointer">Error Details (Dev Only)</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-red-600">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PremiumErrorBoundary;