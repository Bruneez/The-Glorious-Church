export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
};

export const SORT_TYPES = {
  AUTO: 'auto',
  STRING: 'string',
  NUMBER: 'number',
  DATE: 'date',
  ACTIVITY: 'activity',
  ORDERED: 'ordered',
};

export function normalizeSortDirection(direction) {
  return direction === SORT_DIRECTION.DESC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
}

export function isNullishSortValue(value) {
  if (value == null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

export function getFieldValue(record, field) {
  if (!record || !field) return undefined;
  return record[field];
}

export function parseSortableDate(value) {
  if (isNullishSortValue(value)) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function applyDirection(result, direction) {
  if (result === 0) return 0;
  return direction === SORT_DIRECTION.DESC ? -result : result;
}

export function compareNullishValues(a, b, compareValues) {
  const aIsNull = isNullishSortValue(a);
  const bIsNull = isNullishSortValue(b);

  if (aIsNull && bIsNull) return 0;
  if (aIsNull) return 1;
  if (bIsNull) return -1;

  return compareValues(a, b);
}

function comparePresentValues(a, b, compareValues, direction) {
  const nullComparison = compareNullishValues(a, b, () => 0);
  if (nullComparison !== 0) {
    return nullComparison;
  }

  return applyDirection(compareValues(a, b), direction);
}

export function compareStrings(a, b, direction = SORT_DIRECTION.ASC) {
  return comparePresentValues(
    a,
    b,
    (left, right) =>
      String(left).localeCompare(String(right), undefined, { sensitivity: 'base' }),
    normalizeSortDirection(direction),
  );
}

export function compareNumbers(a, b, direction = SORT_DIRECTION.ASC) {
  return comparePresentValues(
    a,
    b,
    (left, right) => {
      const numA = Number(left);
      const numB = Number(right);

      if (!Number.isFinite(numA) && !Number.isFinite(numB)) return 0;
      if (!Number.isFinite(numA)) return 1;
      if (!Number.isFinite(numB)) return -1;

      if (numA < numB) return -1;
      if (numA > numB) return 1;
      return 0;
    },
    normalizeSortDirection(direction),
  );
}

export function compareDates(a, b, direction = SORT_DIRECTION.ASC) {
  return comparePresentValues(
    a,
    b,
    (left, right) => {
      const dateA = parseSortableDate(left);
      const dateB = parseSortableDate(right);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      const timeA = dateA.getTime();
      const timeB = dateB.getTime();

      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;
      return 0;
    },
    normalizeSortDirection(direction),
  );
}

export function compareActivityValues(a, b, direction = SORT_DIRECTION.ASC) {
  return compareDates(a, b, direction);
}

export function compareOrderedValues(a, b, order = [], direction = SORT_DIRECTION.ASC) {
  const normalizedOrder = Array.isArray(order) ? order : [];
  const unknownRank = normalizedOrder.length;

  const rankOf = (value) => {
    const normalized = String(value ?? '').trim();
    const index = normalizedOrder.indexOf(normalized);
    return index === -1 ? unknownRank : index;
  };

  return comparePresentValues(
    a,
    b,
    (left, right) => {
      const rankA = rankOf(left);
      const rankB = rankOf(right);

      if (rankA < rankB) return -1;
      if (rankA > rankB) return 1;
      return 0;
    },
    normalizeSortDirection(direction),
  );
}

function isNumericSortValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return true;
  }
  return false;
}

function isDateSortValue(value) {
  return parseSortableDate(value) !== null;
}

export function detectSortType(valueA, valueB) {
  if (isNullishSortValue(valueA) || isNullishSortValue(valueB)) {
    if (isNumericSortValue(valueA) || isNumericSortValue(valueB)) {
      return SORT_TYPES.NUMBER;
    }

    if (isDateSortValue(valueA) || isDateSortValue(valueB)) {
      return SORT_TYPES.DATE;
    }

    return SORT_TYPES.STRING;
  }

  if (isNumericSortValue(valueA) && isNumericSortValue(valueB)) {
    return SORT_TYPES.NUMBER;
  }

  if (isDateSortValue(valueA) && isDateSortValue(valueB)) {
    return SORT_TYPES.DATE;
  }

  return SORT_TYPES.STRING;
}

export function compareValues(
  a,
  b,
  type = SORT_TYPES.AUTO,
  direction = SORT_DIRECTION.ASC,
  options = {},
) {
  const normalizedDirection = normalizeSortDirection(direction);
  const resolvedType = type === SORT_TYPES.AUTO ? detectSortType(a, b) : type;

  switch (resolvedType) {
    case SORT_TYPES.NUMBER:
      return compareNumbers(a, b, normalizedDirection);
    case SORT_TYPES.DATE:
      return compareDates(a, b, normalizedDirection);
    case SORT_TYPES.ACTIVITY:
      return compareActivityValues(a, b, normalizedDirection);
    case SORT_TYPES.ORDERED:
      return compareOrderedValues(a, b, options.order || [], normalizedDirection);
    case SORT_TYPES.STRING:
    default:
      return compareStrings(a, b, normalizedDirection);
  }
}

/**
 * Returns a new sorted array without mutating the input.
 *
 * @param {Array<object>} data
 * @param {string} field
 * @param {'asc'|'desc'} direction
 * @param {{
 *   type?: 'auto'|'string'|'number'|'date'|'activity'|'ordered',
 *   getValue?: (row: object) => unknown,
 *   order?: string[],
 * }} [options]
 */
export function sortData(data, field, direction = SORT_DIRECTION.ASC, options = {}) {
  if (!Array.isArray(data)) return [];

  const normalizedDirection = normalizeSortDirection(direction);
  const sortType = options.type || SORT_TYPES.AUTO;
  const getValue =
    typeof options.getValue === 'function'
      ? options.getValue
      : (row) => getFieldValue(row, field);

  return [...data].sort((rowA, rowB) => {
    const valueA = getValue(rowA);
    const valueB = getValue(rowB);
    return compareValues(valueA, valueB, sortType, normalizedDirection, options);
  });
}
