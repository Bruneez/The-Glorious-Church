import { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default class AppFixesErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[App Fixes] Failed to render module', {
      role: this.props.role || '',
      userId: this.props.userId || '',
      error: error?.message || 'Unknown render error',
      componentStack: info?.componentStack,
    });
  }

  handleRetry() {
    this.setState({ error: null });
    this.props.onRetry?.();
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-root">
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-6 text-center max-w-lg">
            <h2 className="text-sm font-semibold text-white">App Fixes could not be loaded.</h2>
            <p className="text-xs text-slate-400 mt-2">
              Please try again. If the problem continues, contact an administrator.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button type="button" onClick={this.handleRetry}>
                Retry
              </Button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
