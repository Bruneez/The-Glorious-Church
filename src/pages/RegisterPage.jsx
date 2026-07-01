import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthErrorMessage } from '@/services/authService';
import AlertBanner from '@/components/ui/AlertBanner';
import { validateEmail, validateMinLength } from '@/utils/validators';

export default function RegisterPage() {
  const { signUp, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const emailResult = validateEmail(email.trim());
    if (!emailResult.valid) {
      setError(emailResult.message);
      return;
    }

    const passwordResult = validateMinLength(password, 6, 'Password');
    if (!passwordResult.valid) {
      setError(passwordResult.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email.trim(), password);
    } catch (err) {
      console.error('Registration failure:', err);
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
          <p className="text-slate-400">Create your staff portal account</p>
        </div>

        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          Registration is limited to staff members already added by an administrator.
        </p>

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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="name@thegloriouschurch.org"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Portal Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow mt-4 text-xs disabled:opacity-60"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-400 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
