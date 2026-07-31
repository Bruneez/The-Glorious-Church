export const SERVICE_TYPES = {
  GLORIOUS_CHURCH_SERVICE: 'Glorious Church Service',
  CONFERENCE: 'Conference',
  SPECIAL_EVENT: 'Special Event',
  CAMP: 'Camp',
};

export const SERVICE_TYPE_OPTIONS = [
  { value: SERVICE_TYPES.GLORIOUS_CHURCH_SERVICE, label: SERVICE_TYPES.GLORIOUS_CHURCH_SERVICE },
  { value: SERVICE_TYPES.CONFERENCE, label: SERVICE_TYPES.CONFERENCE },
  { value: SERVICE_TYPES.SPECIAL_EVENT, label: SERVICE_TYPES.SPECIAL_EVENT },
  { value: SERVICE_TYPES.CAMP, label: SERVICE_TYPES.CAMP },
];

export const DEFAULT_SERVICE_TYPE = SERVICE_TYPES.GLORIOUS_CHURCH_SERVICE;

/**
 * Reserved for future Service Program capabilities.
 * Hook new features into the page/service layer using these keys.
 */
export const SERVICE_PROGRAM_FUTURE_FEATURES = {
  PRINT_EXPORT_PDF: 'printExportPdf',
  DUPLICATE_PREVIOUS: 'duplicatePrevious',
  ATTACH_TRACKS: 'attachTracks',
  ASSIGN_MINISTRIES: 'assignMinistries',
  PROGRAM_TEMPLATES: 'programTemplates',
};

export const SERVICE_PROGRAM_ROW_FIELDS = [
  { key: 'time', label: 'Time', placeholder: 'e.g. 15:00 - 15:15', minWidth: 'min-w-[128px]' },
  { key: 'programItem', label: 'Program Item', placeholder: 'e.g. Worship 1', minWidth: 'min-w-[140px]' },
  {
    key: 'assignedPersonTeam',
    label: 'Assigned Person / Team',
    placeholder: 'Person or team',
    minWidth: 'min-w-[160px]',
  },
  {
    key: 'musicTrack',
    label: 'Music / Track',
    placeholder: 'Song or track',
    minWidth: 'min-w-[220px]',
    wide: true,
  },
  { key: 'leader', label: 'Leader', placeholder: 'Leader name', minWidth: 'min-w-[120px]' },
];

export function getDefaultServiceDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatServiceDateDisplay(serviceDate) {
  if (!serviceDate) return '—';

  const parsed = new Date(`${serviceDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return serviceDate;

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const DEFAULT_PROGRAM_ROW_COUNT = 10;

export function createEmptyProgramRow(order = 0) {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    time: '',
    programItem: '',
    assignedPersonTeam: '',
    musicTrack: '',
    leader: '',
    order,
  };
}

export function createDefaultProgramRows(count = DEFAULT_PROGRAM_ROW_COUNT) {
  return Array.from({ length: count }, (_, index) => createEmptyProgramRow(index));
}

/**
 * Load saved rows when a program exists; otherwise seed defaults for new editable programs.
 */
export function resolveProgramRowsForDisplay(
  firestoreRows = [],
  { hasSavedProgram = false, seedDefaults = false } = {},
) {
  if (hasSavedProgram) {
    return mapServiceProgramRowsFromFirestore(firestoreRows);
  }

  if (seedDefaults) {
    return createDefaultProgramRows();
  }

  return [];
}

export function serializeProgramRowsForCompare(rows = []) {
  return JSON.stringify(normalizeRowsForSave(rows));
}

export function formatServiceProgramSavedTime(timestamp) {
  if (!timestamp) return '';

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getServiceProgramSaveErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'permission-denied') {
    return 'You do not have permission to save this service program.';
  }

  if (code === 'unavailable') {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  return error?.message || 'Failed to save service program. Please try again.';
}

export function getServiceProgramLoadErrorMessage() {
  return 'Failed to load service program. Please try again.';
}

export function buildServiceProgramDocId(serviceDate, serviceType) {
  const safeType = String(serviceType || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${serviceDate}__${safeType || 'service'}`;
}

export function normalizeRowsForSave(rows = []) {
  return rows.map((row, index) => ({
    id: row.id,
    time: String(row.time || '').trim(),
    programItem: String(row.programItem || '').trim(),
    assignedPersonTeam: String(row.assignedPersonTeam || '').trim(),
    musicTrack: String(row.musicTrack || '').trim(),
    leader: String(row.leader || '').trim(),
    order: index,
  }));
}

export function mapServiceProgramRowsFromFirestore(rows = []) {
  return [...rows]
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    .map((row) => ({
      id: row.id,
      time: row.time || '',
      programItem: row.programItem || '',
      assignedPersonTeam: row.assignedPersonTeam || '',
      musicTrack: row.musicTrack || '',
      leader: row.leader || '',
      order: row.order ?? 0,
    }));
}

export function buildServiceProgramPayload({
  serviceDate,
  serviceType,
  rows,
  createdBy = '',
  createdAt = '',
  updatedAt = '',
  updatedBy = '',
}) {
  return {
    serviceDate,
    serviceType,
    rows: normalizeRowsForSave(rows),
    createdBy: String(createdBy || '').trim(),
    createdAt,
    updatedAt,
    updatedBy: String(updatedBy || createdBy || '').trim(),
  };
}

export const SERVICE_PROGRAM_COLUMNS = [
  ...SERVICE_PROGRAM_ROW_FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
  })),
  { key: 'actions', label: 'Actions', className: 'text-right', cellClassName: 'text-right' },
];

export const SERVICE_PROGRAM_EMPTY_MESSAGE =
  'No program items yet. Add rows to build the service running order.';

export const SERVICE_PROGRAM_VIEW_EMPTY_MESSAGE =
  'No program items for this service yet.';

export function moveProgramRow(rows, rowIndex, direction) {
  const targetIndex = rowIndex + direction;
  if (targetIndex < 0 || targetIndex >= rows.length) return rows;

  const nextRows = [...rows];
  [nextRows[rowIndex], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[rowIndex]];
  return nextRows;
}

export function getServiceProgramFieldCellClass(field) {
  return [
    field.minWidth || 'min-w-[120px]',
    field.wide ? 'max-w-[360px]' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
