const DRAFT_STORAGE_PREFIX = 'tgc-form-draft';
const DRAFT_VERSION = 1;

export const DRAFT_SENSITIVE_FIELDS = new Set([
  'password',
  'confirmPassword',
  'token',
  'tokens',
  'idToken',
  'refreshToken',
  'accessToken',
  'apiKey',
  'secret',
  'credential',
  'credentials',
]);

export function buildFormDraftStorageKey({ userId = '', formId = '', recordKey = 'new' } = {}) {
  const safeUserId = String(userId || 'anonymous').trim() || 'anonymous';
  const safeFormId = String(formId || 'form').trim() || 'form';
  const safeRecordKey = String(recordKey || 'new').trim() || 'new';
  return `${DRAFT_STORAGE_PREFIX}:${safeUserId}:${safeFormId}:${safeRecordKey}`;
}

export function sanitizeDraftValues(
  values,
  { excludeFields = [], extraSensitiveFields = [] } = {},
) {
  if (values === null || values === undefined) return values;
  if (typeof values !== 'object') return values;

  const excluded = new Set([
    ...DRAFT_SENSITIVE_FIELDS,
    ...extraSensitiveFields,
    ...excludeFields,
  ]);

  if (Array.isArray(values)) {
    return values.map((item) => sanitizeDraftValues(item, { excludeFields, extraSensitiveFields }));
  }

  return Object.fromEntries(
    Object.entries(values)
      .filter(([key]) => !excluded.has(key))
      .map(([key, value]) => [key, sanitizeDraftValues(value, { excludeFields, extraSensitiveFields })]),
  );
}

function getLocalStorage() {
  if (typeof globalThis.localStorage === 'undefined') return null;
  return globalThis.localStorage;
}

export function readFormDraft(storageKey) {
  const storage = getLocalStorage();
  if (!storageKey || !storage) return null;

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== DRAFT_VERSION || !parsed.values) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function writeFormDraft(storageKey, { recordKey = 'new', values = {} } = {}) {
  const storage = getLocalStorage();
  if (!storageKey || !storage) return;

  const payload = {
    version: DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    recordKey,
    values,
  };

  try {
    storage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Ignore quota or privacy errors.
  }
}

export function clearFormDraft(storageKey) {
  const storage = getLocalStorage();
  if (!storageKey || !storage) return;

  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage errors.
  }
}

export function hasRestorableDraft(draft, baseline) {
  if (!draft?.values) return false;
  return stableSerializeDraft(draft.values) !== stableSerializeDraft(baseline);
}

function stableSerializeDraft(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerializeDraft(item)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerializeDraft(value[key])}`).join(',')}}`;
}
