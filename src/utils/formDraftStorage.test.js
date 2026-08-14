import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFormDraftStorageKey,
  clearFormDraft,
  readFormDraft,
  sanitizeDraftValues,
  writeFormDraft,
} from './formDraftStorage.js';

test('buildFormDraftStorageKey scopes drafts by user and form', () => {
  assert.equal(
    buildFormDraftStorageKey({ userId: 'user-1', formId: 'member-form', recordKey: 'new' }),
    'tgc-form-draft:user-1:member-form:new',
  );
});

test('sanitizeDraftValues removes sensitive credential fields', () => {
  assert.deepEqual(
    sanitizeDraftValues({
      name: 'Staff',
      password: 'secret',
      confirmPassword: 'secret',
      token: 'abc',
      nested: { apiKey: 'hidden', title: 'Project' },
    }),
    {
      name: 'Staff',
      nested: { title: 'Project' },
    },
  );
});

test('writeFormDraft and readFormDraft persist sanitized payloads', () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };

  const key = buildFormDraftStorageKey({
    userId: 'user-1',
    formId: 'project-form',
    recordKey: 'new',
  });

  writeFormDraft(key, {
    recordKey: 'new',
    values: sanitizeDraftValues({ title: 'Draft project', password: 'nope' }),
  });

  const draft = readFormDraft(key);
  assert.equal(draft.recordKey, 'new');
  assert.deepEqual(draft.values, { title: 'Draft project' });

  clearFormDraft(key);
  assert.equal(readFormDraft(key), null);

  delete globalThis.localStorage;
});
