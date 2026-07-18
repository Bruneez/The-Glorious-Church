/**
 * Verify staff documents are aligned at staff/{authUid} for Firestore rules.
 *
 * Uses the public Firebase REST API with a staff sign-in (no Admin SDK required).
 *
 * Usage:
 *   set STAFF_VERIFY_EMAIL=you@example.com
 *   set STAFF_VERIFY_PASSWORD=your-password
 *   npm run verify:staff-auth-docs
 *
 * Optional:
 *   set FIREBASE_PROJECT_ID=the-glorious-church
 */

const fetch = globalThis.fetch;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'the-glorious-church';
const EMAIL = String(process.env.STAFF_VERIFY_EMAIL || '').trim();
const PASSWORD = String(process.env.STAFF_VERIFY_PASSWORD || '');
const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAn5QFh6RjOxXeFplA6MRejmWHyHlll87c';

function getStaffAuthUid(data = {}) {
  const fields = data.fields || {};
  const uid = fields.uid?.stringValue || fields.authUid?.stringValue || '';
  return String(uid).trim();
}

function getFieldString(fields, key) {
  return fields?.[key]?.stringValue || '';
}

async function signIn() {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Set STAFF_VERIFY_EMAIL and STAFF_VERIFY_PASSWORD environment variables before running this script.',
    );
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
    },
  );

  const body = await response.json();
  if (!response.ok || !body.idToken) {
    throw new Error(body.error?.message || 'Sign-in failed. Check email and password.');
  }

  return {
    idToken: body.idToken,
    localId: body.localId,
    email: body.email,
  };
}

async function listStaffDocuments(idToken) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/staff`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
    },
  );

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.message || 'Failed to list staff documents.');
  }

  return body.documents || [];
}

function classifyStaffDocument(documentName, fields) {
  const docId = documentName.split('/').pop();
  const authUid = getStaffAuthUid({ fields });
  const email = getFieldString(fields, 'email');
  const role = getFieldString(fields, 'role');
  const name = getFieldString(fields, 'fullName') || getFieldString(fields, 'name');

  if (!authUid) {
    return {
      status: 'missing-auth-uid',
      docId,
      email,
      role,
      name,
      message: 'No uid/authUid field — manual fix required before rules deploy.',
    };
  }

  if (docId === authUid) {
    return {
      status: 'aligned',
      docId,
      authUid,
      email,
      role,
      name,
      message: 'Document ID matches auth UID — rules will work.',
    };
  }

  return {
    status: 'legacy',
    docId,
    authUid,
    email,
    role,
    name,
    message: 'Legacy random doc ID — migrate before rules deploy.',
  };
}

function printReport(results, signedInUser) {
  const grouped = {
    aligned: [],
    legacy: [],
    'missing-auth-uid': [],
  };

  results.forEach((result) => {
    grouped[result.status].push(result);
  });

  console.log('');
  console.log('='.repeat(72));
  console.log(`Staff auth-doc verification — project: ${PROJECT_ID}`);
  console.log(`Signed in as: ${signedInUser.email} (auth UID: ${signedInUser.localId})`);
  console.log('='.repeat(72));
  console.log('');

  console.log(`Total staff documents: ${results.length}`);
  console.log(`  Aligned (staff/{authUid}): ${grouped.aligned.length}`);
  console.log(`  Legacy (needs migration):  ${grouped.legacy.length}`);
  console.log(`  Missing uid/authUid:       ${grouped['missing-auth-uid'].length}`);
  console.log('');

  const currentUserDoc = results.find(
    (item) => item.docId === signedInUser.localId || item.authUid === signedInUser.localId,
  );

  if (currentUserDoc?.status === 'aligned') {
    console.log('Your account: READY — your staff doc matches staff/{authUid}.');
  } else if (currentUserDoc?.status === 'legacy') {
    console.log(
      'Your account: NEEDS MIGRATION — sign out/in after deploying app code, or run npm run migrate:staff-auth-docs.',
    );
  } else if (grouped.legacy.some((item) => item.authUid === signedInUser.localId)) {
    console.log(
      'Your account: LEGACY DOC FOUND — a random-ID doc points to your auth UID. Migration required.',
    );
  } else {
    console.log(
      'Your account: No staff/{authUid} doc found for your signed-in user. Rules will block Travelling.',
    );
  }

  console.log('');

  if (grouped.legacy.length > 0) {
    console.log('Legacy documents:');
    grouped.legacy.forEach((item) => {
      console.log(`  - ${item.docId} -> should be staff/${item.authUid} (${item.email || item.name || 'no email'})`);
    });
    console.log('');
  }

  if (grouped['missing-auth-uid'].length > 0) {
    console.log('Documents missing uid/authUid:');
    grouped['missing-auth-uid'].forEach((item) => {
      console.log(`  - ${item.docId} (${item.email || item.name || 'no email'})`);
    });
    console.log('');
  }

  if (grouped.aligned.length > 0) {
    console.log('Aligned documents:');
    grouped.aligned.forEach((item) => {
      console.log(`  - staff/${item.docId} (${item.role || 'Unknown role'} — ${item.email || item.name})`);
    });
    console.log('');
  }

  const readyForRules = grouped.legacy.length === 0 && grouped['missing-auth-uid'].length === 0;

  if (readyForRules) {
    console.log('GO: Safe to deploy Firestore + Storage rules for Travelling.');
  } else {
    console.log('NO-GO: Do not deploy Travelling rules yet.');
    console.log('Next steps:');
    console.log('  1. Deploy the latest app code (includes login-time migration).');
    console.log('  2. Run: npm run migrate:staff-auth-docs:dry-run');
    console.log('  3. Run: npm run migrate:staff-auth-docs');
    console.log('  4. Re-run: npm run verify:staff-auth-docs');
  }

  console.log('');
}

async function main() {
  const signedInUser = await signIn();
  const documents = await listStaffDocuments(signedInUser.idToken);
  const results = documents.map((document) =>
    classifyStaffDocument(document.name, document.fields || {}),
  );

  printReport(results, signedInUser);

  const blocked = results.some(
    (item) => item.status === 'legacy' || item.status === 'missing-auth-uid',
  );
  process.exitCode = blocked ? 1 : 0;
}

main().catch((error) => {
  console.error('Verification failed:', error.message || error);
  process.exit(1);
});
