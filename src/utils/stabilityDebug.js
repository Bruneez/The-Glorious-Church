const LOG_PREFIX = '[Stability]';

const SENSITIVE_KEYS = new Set([
  'email',
  'password',
  'confirmPassword',
  'token',
  'secret',
  'photo',
  'phone',
  'message',
  'name',
  'surname',
  'displayName',
]);

function redactUid(uid) {
  if (typeof uid !== 'string' || !uid) return null;
  return `${uid.slice(0, 8)}…`;
}

export function sanitizeStabilityPayload(payload = {}) {
  const sanitized = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'uid' || key === 'fromUid' || key === 'toUid') {
      sanitized[key] = redactUid(value);
      return;
    }

    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = '[redacted]';
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
}

export function logStability(event, payload = {}) {
  if (!import.meta.env.DEV) return;

  console.info(LOG_PREFIX, event, {
    at: new Date().toISOString(),
    ...sanitizeStabilityPayload(payload),
  });
}
