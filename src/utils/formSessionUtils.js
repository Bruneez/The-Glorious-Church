export function resolveFormRecordKey(record, { createKey = 'new', idField = 'id' } = {}) {
  const id = String(record?.[idField] || (idField !== 'id' ? record?.id : '') || '').trim();
  return id || createKey;
}

export function shouldInitializeFormSession({
  isOpen,
  recordKey,
  previousIsOpen = false,
  previousRecordKey = '',
}) {
  if (!isOpen) return false;
  if (!previousIsOpen) return true;
  return recordKey !== previousRecordKey;
}

export function createFormSessionKey({ formSessionKey = 0, recordKey = 'new', scope = '' } = {}) {
  const scopeSuffix = scope ? `-${scope}` : '';
  return `${formSessionKey}-${recordKey}${scopeSuffix}`;
}
