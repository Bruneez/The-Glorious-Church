import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/services/authService';
import AlertBanner from '@/components/ui/AlertBanner';

export default function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
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
      navigate(redirectTo, { replace: true });
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
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white tracking-wide">The Glorious Church</h2>
          <p className="text-slate-400">Management Roster Authentication Node</p>
        </div>

        <AlertBanner message={error} />

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Secure Log Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
              placeholder="name@thegloriouschurch.org"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Portal Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow mt-4 text-xs disabled:opacity-60"
          >
            <LogIn className="w-3.5 h-3.5" />
            {isSubmitting ? 'Verifying Identity...' : 'Sign In to Portal'}
          </button>
        </form>

        <p className="text-center text-slate-400 pt-1">
          First time here?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
