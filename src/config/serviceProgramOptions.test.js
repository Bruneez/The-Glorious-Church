import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROGRAM_ROW_COUNT,
  buildServiceProgramDocId,
  buildServiceProgramPayload,
  canSaveServiceProgram,
  createDefaultProgramRows,
  createEmptyProgramRow,
  getServiceProgramSaveErrorMessage,
  mapServiceProgramRowsFromFirestore,
  moveProgramRow,
  normalizeRowsForSave,
  resolveProgramRowsForDisplay,
  serializeProgramRowsForCompare,
} from './serviceProgramOptions.js';

test('createDefaultProgramRows creates the requested number of blank rows', () => {
  const rows = createDefaultProgramRows(10);

  assert.equal(rows.length, DEFAULT_PROGRAM_ROW_COUNT);
  assert.equal(rows[0].order, 0);
  assert.equal(rows[9].order, 9);
  assert.equal(rows.every((row) => row.time === ''), true);
});

test('resolveProgramRowsForDisplay seeds defaults only for new editable programs', () => {
  assert.equal(resolveProgramRowsForDisplay([], { hasSavedProgram: true, seedDefaults: true }).length, 0);
  assert.equal(resolveProgramRowsForDisplay([], { hasSavedProgram: false, seedDefaults: false }).length, 0);
  assert.equal(resolveProgramRowsForDisplay([], { hasSavedProgram: false, seedDefaults: true }).length, 10);
});

test('resolveProgramRowsForDisplay preserves saved row count and order', () => {
  const savedRows = [
    { id: 'a', time: '09:00', programItem: 'Welcome', order: 1 },
    { id: 'b', time: '09:15', programItem: 'Worship', order: 0 },
  ];

  const resolved = resolveProgramRowsForDisplay(savedRows, { hasSavedProgram: true });

  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].programItem, 'Worship');
  assert.equal(resolved[1].programItem, 'Welcome');
});

test('buildServiceProgramDocId creates a stable date and type key', () => {
  assert.equal(
    buildServiceProgramDocId('2026-07-31', 'Glorious Church Service'),
    '2026-07-31__glorious-church-service',
  );
});

test('normalizeRowsForSave stores row order by current table position', () => {
  const rows = [
    { ...createEmptyProgramRow(5), programItem: 'Second', order: 99 },
    { ...createEmptyProgramRow(2), programItem: 'First', order: 1 },
  ];

  const normalized = normalizeRowsForSave(rows);

  assert.deepEqual(
    normalized.map((row) => row.programItem),
    ['Second', 'First'],
  );
  assert.deepEqual(
    normalized.map((row) => row.order),
    [0, 1],
  );
});

test('moveProgramRow swaps adjacent rows without losing values', () => {
  const rows = [
    { ...createEmptyProgramRow(0), programItem: 'One' },
    { ...createEmptyProgramRow(1), programItem: 'Two' },
    { ...createEmptyProgramRow(2), programItem: 'Three' },
  ];

  const moved = moveProgramRow(rows, 1, -1);

  assert.deepEqual(
    moved.map((row) => row.programItem),
    ['Two', 'One', 'Three'],
  );
});

test('serializeProgramRowsForCompare detects row changes', () => {
  const baseline = [{ ...createEmptyProgramRow(0), programItem: 'Welcome' }];
  const changed = [{ ...createEmptyProgramRow(0), programItem: 'Updated' }];

  assert.equal(
    serializeProgramRowsForCompare(baseline),
    serializeProgramRowsForCompare([...baseline]),
  );
  assert.notEqual(
    serializeProgramRowsForCompare(baseline),
    serializeProgramRowsForCompare(changed),
  );
});

test('mapServiceProgramRowsFromFirestore fills missing row fields safely', () => {
  const mapped = mapServiceProgramRowsFromFirestore([
    { id: 'row-1', time: '10:00', order: 0 },
  ]);

  assert.equal(mapped[0].programItem, '');
  assert.equal(mapped[0].leader, '');
});

test('buildServiceProgramPayload persists header fields and normalized rows', () => {
  const payload = buildServiceProgramPayload({
    serviceDate: '2026-07-31',
    serviceType: 'Glorious Church Service',
    rows: [{ ...createEmptyProgramRow(0), programItem: 'Welcome' }],
    createdBy: 'Lead Pastor',
    createdAt: '2026-07-31T08:00:00.000Z',
    updatedAt: '2026-07-31T09:00:00.000Z',
    updatedBy: 'Lead Pastor',
  });

  assert.equal(payload.serviceDate, '2026-07-31');
  assert.equal(payload.serviceType, 'Glorious Church Service');
  assert.equal(payload.createdBy, 'Lead Pastor');
  assert.equal(payload.updatedBy, 'Lead Pastor');
  assert.equal(payload.rows[0].programItem, 'Welcome');
  assert.equal(payload.rows[0].order, 0);
});

test('canSaveServiceProgram enables save for new, edited, or failed programs only', () => {
  assert.equal(
    canSaveServiceProgram({
      canManage: true,
      isSaving: false,
      isTableLoading: false,
      isDirty: false,
      saveStatus: 'unsaved',
    }),
    true,
  );

  assert.equal(
    canSaveServiceProgram({
      canManage: true,
      isSaving: false,
      isTableLoading: false,
      isDirty: true,
      saveStatus: 'saved',
    }),
    true,
  );

  assert.equal(
    canSaveServiceProgram({
      canManage: true,
      isSaving: false,
      isTableLoading: false,
      isDirty: false,
      saveStatus: 'saved',
    }),
    false,
  );

  assert.equal(
    canSaveServiceProgram({
      canManage: false,
      isSaving: false,
      isTableLoading: false,
      isDirty: true,
      saveStatus: 'unsaved',
    }),
    false,
  );
});

test('getServiceProgramSaveErrorMessage maps Firestore permission failures', () => {
  assert.match(
    getServiceProgramSaveErrorMessage({ code: 'firestore/permission-denied' }),
    /permission to save/i,
  );
});
