import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/services/authService';
import AlertBanner from '@/components/ui/AlertBanner';
import churchLogo from '@/assets/The GC Official Logo.png';

export default function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Verifying session...</p>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Authentication Failure:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-900 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700/70 rounded-xl w-full max-w-sm shadow-xl p-6 space-y-4 text-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-slate-900/60 border border-slate-700/70 p-1 flex items-center justify-center shrink-0">
              <img
                src={churchLogo}
                alt="Glorious Church Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="min-w-0 text-lg font-bold text-indigo-300 tracking-wide truncate">
              The Glorious Church
            </h2>
          </div>
          <p className="text-center text-slate-400">The Glorious Church Management System</p>
        </div>

        <AlertBanner message={error} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="name@thegloriouschurch.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>

            <button
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-400 pt-1">
          New staff accounts are created by an administrator. Please contact your admin if you need access.
        </p>
      </div>
    </div>
  );
}
