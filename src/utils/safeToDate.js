export function safeToDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    try {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function safeToMillis(value) {
  const date = safeToDate(value);
  return date ? date.getTime() : 0;
}

export function safeFormatDate(value, formatter) {
  const date = safeToDate(value);
  if (!date) return '';
  try {
    return formatter(date);
  } catch {
    return '';
  }
}
