import { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[${this.props.moduleName || 'Section'}] Render error`, {
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
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-6 text-center max-w-lg mx-auto">
            <h2 className="text-sm font-semibold text-white">
              {this.props.title || `${this.props.moduleName || 'This section'} could not be loaded.`}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              {this.props.description || 'Something went wrong while rendering this page. Your session is still active.'}
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button type="button" onClick={this.handleRetry}>
                Try Again
              </Button>
              <Link
                to={this.props.fallbackPath || '/dashboard'}
                className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                {this.props.fallbackLabel || 'Back to Dashboard'}
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
