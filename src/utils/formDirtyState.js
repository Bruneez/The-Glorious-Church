export function stableSerialize(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
}

export function areFormValuesEqual(left, right) {
  return stableSerialize(left) === stableSerialize(right);
}

export function isFormDirty({
  isOpen = false,
  isSubmitting = false,
  baseline = null,
  current = null,
  attachmentDirty = false,
} = {}) {
  if (!isOpen || isSubmitting) return false;
  if (attachmentDirty) return true;
  return !areFormValuesEqual(baseline, current);
}
