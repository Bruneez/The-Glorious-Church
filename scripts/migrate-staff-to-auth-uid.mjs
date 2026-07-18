/**
 * One-time migration: move legacy staff docs to staff/{authUid}.
 *
 * Prerequisites:
 * - Firebase Admin credentials (GOOGLE_APPLICATION_CREDENTIALS or gcloud auth application-default login)
 * - Run before deploying strict travelDestinations Firestore rules
 *
 * Usage:
 *   npm run migrate:staff-auth-docs
 *   npm run migrate:staff-auth-docs -- --dry-run
 */

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, '../functions/package.json'));
const admin = require('firebase-admin');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'the-glorious-church';
const STAFF_COLLECTION = 'staff';
const NOTIFICATIONS_COLLECTION = 'notifications';
const TASKS_COLLECTION = 'tasks';
const dryRun = process.argv.includes('--dry-run');

function getStaffAuthUid(data = {}) {
  return String(data.uid || data.authUid || '').trim();
}

async function updateQueryField(collectionName, field, legacyId, authUid) {
  const snapshot = await admin.firestore().collection(collectionName).where(field, '==', legacyId).get();

  if (snapshot.empty) {
    return 0;
  }

  if (dryRun) {
    return snapshot.size;
  }

  let updated = 0;
  let batch = admin.firestore().batch();
  let batchCount = 0;

  for (const docSnapshot of snapshot.docs) {
    batch.update(docSnapshot.ref, { [field]: authUid });
    batchCount += 1;
    updated += 1;

    if (batchCount >= 400) {
      await batch.commit();
      batch = admin.firestore().batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return updated;
}

async function migrateStaffDoc(docSnapshot) {
  const legacyId = docSnapshot.id;
  const data = docSnapshot.data() || {};
  const authUid = getStaffAuthUid(data);

  if (!authUid) {
    return { status: 'skipped', reason: 'missing uid/authUid', legacyId };
  }

  if (legacyId === authUid) {
    if (!data.uid || !data.authUid) {
      if (!dryRun) {
        await docSnapshot.ref.set(
          {
            uid: authUid,
            authUid,
          },
          { merge: true },
        );
      }
      return { status: 'normalized', legacyId, authUid };
    }

    return { status: 'already-aligned', legacyId, authUid };
  }

  const targetRef = admin.firestore().collection(STAFF_COLLECTION).doc(authUid);
  const mergedPayload = {
    ...data,
    uid: authUid,
    authUid,
    legacyStaffDocId: legacyId,
    migratedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (dryRun) {
    const [notificationSnapshot, taskSnapshot] = await Promise.all([
      admin.firestore().collection(NOTIFICATIONS_COLLECTION).where('userId', '==', legacyId).get(),
      admin
        .firestore()
        .collection(TASKS_COLLECTION)
        .where('assignedUserId', '==', legacyId)
        .get(),
    ]);

    return {
      status: 'would-migrate',
      legacyId,
      authUid,
      notifications: notificationSnapshot.size,
      tasks: taskSnapshot.size,
    };
  }

  await targetRef.set(mergedPayload, { merge: true });

  const [notificationsUpdated, tasksUpdated] = await Promise.all([
    updateQueryField(NOTIFICATIONS_COLLECTION, 'userId', legacyId, authUid),
    updateQueryField(TASKS_COLLECTION, 'assignedUserId', legacyId, authUid),
  ]);

  await docSnapshot.ref.delete();

  return {
    status: 'migrated',
    legacyId,
    authUid,
    notificationsUpdated,
    tasksUpdated,
  };
}

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }

  console.log(`Staff auth UID migration (${dryRun ? 'dry run' : 'live'}) for project: ${PROJECT_ID}`);

  const snapshot = await admin.firestore().collection(STAFF_COLLECTION).get();
  const results = {
    migrated: 0,
    normalized: 0,
    alreadyAligned: 0,
    skipped: 0,
    wouldMigrate: 0,
    errors: 0,
  };

  for (const docSnapshot of snapshot.docs) {
    try {
      const result = await migrateStaffDoc(docSnapshot);
      console.log(JSON.stringify(result));

      if (result.status === 'migrated') results.migrated += 1;
      else if (result.status === 'normalized') results.normalized += 1;
      else if (result.status === 'already-aligned') results.alreadyAligned += 1;
      else if (result.status === 'skipped') results.skipped += 1;
      else if (result.status === 'would-migrate') results.wouldMigrate += 1;
    } catch (error) {
      results.errors += 1;
      console.error(`Failed to migrate ${docSnapshot.id}:`, error);
    }
  }

  console.log('Summary:', results);

  if (results.errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
