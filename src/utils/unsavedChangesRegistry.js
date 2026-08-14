const guards = new Set();
const activityListeners = new Set();

function notifyGuardActivity() {
  activityListeners.forEach((listener) => {
    listener();
  });
}

export function registerUnsavedChangesGuard(guard) {
  guards.add(guard);
  notifyGuardActivity();
  return () => {
    guards.delete(guard);
    notifyGuardActivity();
  };
}

export function subscribeUnsavedChangesGuardActivity(listener) {
  activityListeners.add(listener);
  return () => activityListeners.delete(listener);
}

export function hasDirtyUnsavedChanges() {
  for (const guard of guards) {
    if (guard.isActive?.() && guard.isDirty?.()) {
      return true;
    }
  }
  return false;
}

export function getActiveUnsavedChangesGuard() {
  for (const guard of guards) {
    if (guard.isActive?.()) {
      return guard;
    }
  }
  return null;
}

export function requestGuardedNavigation(proceed) {
  const guard = getActiveUnsavedChangesGuard();
  if (!guard?.isDirty?.()) {
    proceed();
    return true;
  }

  guard.requestLeave?.(proceed);
  return false;
}
