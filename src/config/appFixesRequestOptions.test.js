import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_FIX_PRIORITY,
  APP_FIX_STATUS,
} from './appFixesConstants.js';
import {
  buildAppFixRequestFirestoreDocument,
  buildAppFixRequestPayload,
  filterAppFixRequests,
  validateAppFixRequestForm,
  validateAppFixRequestTitle,
  validateOptionalHttpUrl,
} from './appFixesRequestOptions.js';
import {
  buildAppFixUpdateFirestoreDocument,
  buildAppFixUpdatePayload,
  validateAppFixUpdateForm,
} from './appFixesUpdateOptions.js';
import {
  buildAppFixAttachmentFirestoreDocument,
  buildAppFixAttachmentPayload,
  validateAppFixAttachmentFile,
} from './appFixesAttachmentOptions.js';

test('validateAppFixRequestTitle requires a non-empty title', () => {
  assert.equal(validateAppFixRequestTitle(''), 'Title is required.');
  assert.equal(validateAppFixRequestTitle('Login issue'), '');
});

test('validateOptionalHttpUrl accepts HTTP and HTTPS only', () => {
  assert.equal(validateOptionalHttpUrl('https://example.com/page'), '');
  assert.equal(validateOptionalHttpUrl(''), '');
  assert.match(validateOptionalHttpUrl('javascript:alert(1)'), /HTTP or HTTPS/i);
});

test('validateAppFixRequestForm validates enums and defaults', () => {
  assert.match(
    validateAppFixRequestForm({ title: 'Broken button', status: 'invalid' }),
    /Status is invalid/i,
  );
  assert.equal(
    validateAppFixRequestForm({
      title: 'Broken button',
      category: 'bug',
      affectedModule: '/dashboard',
      priority: 'medium',
      description: 'Button does nothing when clicked.',
      deviceType: 'desktop',
      browserMode: 'chrome',
    }),
    '',
  );
});

test('buildAppFixRequestPayload normalizes optional fields and defaults', () => {
  const payload = buildAppFixRequestPayload(
    {
      title: '  Broken button  ',
      description: ' Button does nothing ',
      status: 'invalid-status',
      priority: 'urgent',
      category: 'bug',
      deviceType: 'mobile',
      browserMode: 'safari',
    },
    { createdByUserId: 'user-123' },
  );

  assert.equal(payload.title, 'Broken button');
  assert.equal(payload.description, 'Button does nothing');
  assert.equal(payload.status, APP_FIX_STATUS.OPEN);
  assert.equal(payload.priority, APP_FIX_PRIORITY.URGENT);
  assert.equal(payload.createdByUserId, 'user-123');
});

test('buildAppFixRequestFirestoreDocument strips undefined values', () => {
  const document = buildAppFixRequestFirestoreDocument(
    buildAppFixRequestPayload({ title: 'Issue' }, { createdByUserId: 'user-1' }),
    { createdAt: 'now', updatedAt: 'now', deletedAt: null },
  );

  assert.equal(document.title, 'Issue');
  assert.equal(document.createdAt, 'now');
  assert.equal(document.deletedAt, null);
});

test('filterAppFixRequests supports search and filters', () => {
  const filtered = filterAppFixRequests(
    [
      { title: 'Login issue', status: APP_FIX_STATUS.OPEN, priority: APP_FIX_PRIORITY.HIGH },
      { title: 'Calendar bug', status: APP_FIX_STATUS.RESOLVED, priority: APP_FIX_PRIORITY.LOW },
    ],
    { searchTerm: 'login', statusFilter: APP_FIX_STATUS.OPEN },
  );

  assert.deepEqual(filtered.map((request) => request.title), ['Login issue']);
});

test('validateAppFixUpdateForm requires request id and message', () => {
  assert.match(validateAppFixUpdateForm({ message: 'Updated status' }), /Request ID is required/i);
  assert.equal(
    validateAppFixUpdateForm({ requestId: 'req-1', message: 'Updated status' }),
    '',
  );
});

test('buildAppFixUpdatePayload defaults update type to comment', () => {
  const payload = buildAppFixUpdatePayload(
    { requestId: 'req-1', message: 'Working on this now.' },
    { createdByUserId: 'admin-1' },
  );

  assert.equal(payload.updateType, 'comment');
  assert.equal(payload.createdByUserId, 'admin-1');
});

test('validateAppFixAttachmentFile accepts supported file types and size limits', () => {
  assert.equal(
    validateAppFixAttachmentFile({ type: 'image/jpeg', size: 1024, name: 'screen.jpg' }),
    '',
  );
  assert.equal(
    validateAppFixAttachmentFile({ type: 'application/pdf', size: 1024, name: 'log.pdf' }),
    '',
  );
  assert.equal(
    validateAppFixAttachmentFile({ type: 'video/mp4', size: 1024, name: 'recording.mp4' }),
    '',
  );
  assert.match(
    validateAppFixAttachmentFile({ type: 'text/plain', size: 1024, name: 'notes.txt' }),
    /JPG, PNG, WEBP, PDF, MP4, WEBM, or MOV/i,
  );
  assert.match(
    validateAppFixAttachmentFile({ type: 'video/mp4', size: 26 * 1024 * 1024, name: 'big.mp4' }),
    /25 MB/i,
  );
});

test('buildAppFixAttachmentPayload stores upload metadata', () => {
  const payload = buildAppFixAttachmentPayload(
    {
      requestId: 'req-1',
      fileName: 'screen.png',
      fileUrl: 'https://example.com/file.png',
      fileStoragePath: 'app-fixes/req-1/123_screen.png',
      contentType: 'image/png',
      fileSizeBytes: 2048,
    },
    { uploadedByUserId: 'user-1' },
  );

  const document = buildAppFixAttachmentFirestoreDocument(payload, {
    createdAt: 'now',
    deletedAt: null,
  });

  assert.equal(document.fileName, 'screen.png');
  assert.equal(document.uploadedByUserId, 'user-1');
});
