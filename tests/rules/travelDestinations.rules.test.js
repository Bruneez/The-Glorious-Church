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
const projectId = 'tgc-travelling-rules-test';
const rules = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8');

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8108,
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

function authedDb(uid) {
  return testEnv.authenticatedContext(uid).firestore();
}

const internationalDoc = {
  travelExtent: 'international',
  country: 'FR',
  visaRequired: true,
  estimatedCostZar: 12000,
  imageUrl: '',
  imageStoragePath: '',
  createdBy: 'Admin User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const nationalDoc = {
  travelExtent: 'national',
  townCity: 'George',
  distanceFromCapeTownKm: 420,
  recommendedTransport: 'car',
  estimatedCostZar: 1800,
  imageUrl: '',
  imageStoragePath: '',
  createdBy: 'Admin User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

test('authorised pastor can read travel destinations', async () => {
  await seedStaff('pastor-user', 'Pastor');

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection('travelDestinations').doc('intl-1').set(internationalDoc);
  });

  const doc = authedDb('pastor-user').collection('travelDestinations').doc('intl-1');
  await assertSucceeds(doc.get());
});

test('user without staff role cannot read travel destinations', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection('travelDestinations').doc('intl-2').set(internationalDoc);
  });

  const doc = authedDb('guest-user').collection('travelDestinations').doc('intl-2');
  await assertFails(doc.get());
});

test('admin can create update and delete travel destinations', async () => {
  await seedStaff('admin-user', 'Admin');
  const db = authedDb('admin-user');
  const docRef = db.collection('travelDestinations').doc('national-1');

  await assertSucceeds(docRef.set(nationalDoc));
  await assertSucceeds(docRef.update({ estimatedCostZar: 2000, updatedAt: new Date() }));
  await assertSucceeds(docRef.delete());
});

test('non-admin cannot create update or delete travel destinations', async () => {
  await seedStaff('leader-user', 'Creative Arts Leader');
  const db = authedDb('leader-user');
  const docRef = db.collection('travelDestinations').doc('national-2');

  await assertFails(docRef.set(nationalDoc));
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection('travelDestinations').doc('national-2').set(nationalDoc);
  });
  await assertFails(docRef.update({ estimatedCostZar: 2500, updatedAt: new Date() }));
  await assertFails(docRef.delete());
});

test('invalid travel extent and cross-extent fields are rejected', async () => {
  await seedStaff('admin-user-2', 'Admin');
  const db = authedDb('admin-user-2');

  await assertFails(
    db.collection('travelDestinations').doc('bad-extent').set({
      ...internationalDoc,
      travelExtent: 'regional',
    }),
  );

  await assertFails(
    db.collection('travelDestinations').doc('bad-intl').set({
      ...internationalDoc,
      townCity: 'Paris',
    }),
  );

  await assertFails(
    db.collection('travelDestinations').doc('bad-national').set({
      ...nationalDoc,
      country: 'ZA',
    }),
  );

  await assertFails(
    db.collection('travelDestinations').doc('bad-negative').set({
      ...nationalDoc,
      distanceFromCapeTownKm: -10,
    }),
  );
});
