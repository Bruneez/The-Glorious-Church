import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectId = 'tgc-travelling-storage-rules-test';
const storageRules = readFileSync(resolve(__dirname, '../../storage.rules'), 'utf8');
const firestoreRules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8');

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: firestoreRules,
      host: '127.0.0.1',
      port: 8108,
    },
    storage: {
      rules: storageRules,
      host: '127.0.0.1',
      port: 9199,
    },
  });
});

test.after(async () => {
  await testEnv.cleanup();
});

async function seedStaff(uid, role) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection('staff').doc(uid).set({
      uid,
      role,
      fullName: `${role} User`,
      email: `${uid}@example.com`,
    });
  });
}

function authedStorage(uid) {
  return testEnv.authenticatedContext(uid).storage();
}

function pngBlob(sizeBytes = 1024) {
  const buffer = new Uint8Array(sizeBytes);
  return buffer;
}

test('authorised staff can read travel destination images', async () => {
  await seedStaff('pastor-user', 'Pastor');

  const storage = authedStorage('pastor-user');
  const ref = storage.ref('travel-destinations/intl-1/photo.png');

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.storage().ref('travel-destinations/intl-1/photo.png').put(pngBlob(), {
      contentType: 'image/png',
    });
  });

  await assertSucceeds(ref.getMetadata());
});

test('non-admin cannot upload or delete travel destination images', async () => {
  await seedStaff('leader-user', 'Creative Arts Leader');
  const storage = authedStorage('leader-user');
  const ref = storage.ref('travel-destinations/national-1/photo.png');

  await assertFails(ref.put(pngBlob(), { contentType: 'image/png' }));
  await assertFails(ref.delete());
});

test('admin can upload valid travel images and delete them', async () => {
  await seedStaff('admin-user', 'Admin');
  const storage = authedStorage('admin-user');
  const ref = storage.ref('travel-destinations/national-2/photo.jpg');

  await assertSucceeds(ref.put(pngBlob(), { contentType: 'image/jpeg' }));
  await assertSucceeds(ref.delete());
});

test('admin upload rejects invalid content type and oversized files', async () => {
  await seedStaff('admin-user-2', 'Admin');
  const storage = authedStorage('admin-user-2');
  const invalidRef = storage.ref('travel-destinations/national-3/doc.pdf');
  const oversizedRef = storage.ref('travel-destinations/national-3/big.png');

  await assertFails(invalidRef.put(pngBlob(), { contentType: 'application/pdf' }));
  await assertFails(
    oversizedRef.put(pngBlob(5 * 1024 * 1024 + 1), { contentType: 'image/png' }),
  );
});
