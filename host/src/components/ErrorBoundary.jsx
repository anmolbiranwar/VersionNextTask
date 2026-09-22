import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Remote loader failed:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-red-200 rounded-3xl text-center shadow-lg shadow-red-500/5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Failed to Load {this.props.remoteName || 'Remote App'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Unable to connect to{' '}
            <code className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs">
              {this.props.remoteUrl || 'remote host'}
            </code>
            . Please check if the service is running.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
