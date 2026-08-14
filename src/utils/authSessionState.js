export const AUTH_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};

export function resolveAuthStatus({ isLoading, firebaseUser }) {
  if (isLoading) return AUTH_STATUS.LOADING;
  if (!firebaseUser) return AUTH_STATUS.UNAUTHENTICATED;
  return AUTH_STATUS.AUTHENTICATED;
}

export function shouldRedirectToLogin({ isLoading, firebaseUser }) {
  return !isLoading && !firebaseUser;
}

export function canEvaluateRouteAccess({ isStaffSessionLoading, role }) {
  if (!isStaffSessionLoading) return true;
  return Boolean(String(role || '').trim());
}

export function resolvePostLoginPath(fromPath) {
  const value = String(fromPath || '').trim();
  if (!value || value === '/login') return '/dashboard';
  return value;
}
