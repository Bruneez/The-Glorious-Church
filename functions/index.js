const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

admin.initializeApp();

const db = admin.firestore();
const STAFF_COLLECTION = 'staff';

const ROLES = {
  ADMIN: 'Admin',
  PASTOR: 'Pastor',
  CA_LEADER: 'Creative Arts Leader',
};

const ALLOWED_ROLES = new Set(Object.values(ROLES));
const MANAGE_STAFF_ROLES = new Set([ROLES.ADMIN]);

function normalizeRole(role) {
  const value = String(role || '').trim();
  if (!value) return '';

  const lower = value.toLowerCase();
  if (lower === 'admin' || lower === 'administrator') return ROLES.ADMIN;
  if (lower === 'pastor') return ROLES.PASTOR;
  if (lower === 'ca leader' || lower === 'creative arts leader') return ROLES.CA_LEADER;
  return value;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function getStaffByEmail(email) {
  const snapshot = await db
    .collection(STAFF_COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function callerCanManageStaff(callerEmail) {
  const staffSnapshot = await db.collection(STAFF_COLLECTION).limit(1).get();

  if (staffSnapshot.empty) {
    return true;
  }

  const callerStaff = await getStaffByEmail(callerEmail);
  if (!callerStaff) {
    return false;
  }

  return MANAGE_STAFF_ROLES.has(normalizeRole(callerStaff.role));
}

function validateStaffPayload(data) {
  const name = String(data?.name || '').trim();
  const email = normalizeEmail(data?.email);
  const password = String(data?.password || '');
  const role = normalizeRole(data?.role);
  const phone = String(data?.phone || '').trim();
  const photo = String(data?.photo || '').trim();

  if (!name) {
    throw new HttpsError('invalid-argument', 'Staff member name is required.');
  }

  if (!email || !email.includes('@')) {
    throw new HttpsError('invalid-argument', 'A valid email address is required.');
  }

  if (password.length < 6) {
    throw new HttpsError('invalid-argument', 'Password must be at least 6 characters long.');
  }

  if (!ALLOWED_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', 'A valid staff role is required.');
  }

  return { name, email, password, role, phone, photo };
}

exports.createStaffUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to create staff users.');
  }

  const callerEmail = normalizeEmail(request.auth.token.email);
  if (!callerEmail) {
    throw new HttpsError('unauthenticated', 'Your account must have an email address.');
  }

  const allowed = await callerCanManageStaff(callerEmail);
  if (!allowed) {
    throw new HttpsError(
      'permission-denied',
      'Only Admin or Pastor accounts can create staff users.',
    );
  }

  const payload = validateStaffPayload(request.data);
  const existingStaff = await getStaffByEmail(payload.email);
  if (existingStaff) {
    throw new HttpsError(
      'already-exists',
      'A staff record with this email already exists.',
    );
  }

  let authUser;

  try {
    authUser = await admin.auth().createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.name,
    });

    await db.collection(STAFF_COLLECTION).doc(authUser.uid).set({
      uid: authUser.uid,
      authUid: authUser.uid,
      name: payload.name,
      fullName: payload.name,
      email: payload.email,
      role: payload.role,
      phone: payload.phone,
      photo: payload.photo,
      taskModuleEnabled: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
    });

    return {
      uid: authUser.uid,
      staffDocId: authUser.uid,
    };
  } catch (error) {
    if (authUser?.uid) {
      await admin.auth().deleteUser(authUser.uid).catch(() => {});
    }

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error?.code === 'auth/email-already-in-use') {
      throw new HttpsError(
        'already-exists',
        'An account with this email already exists.',
      );
    }

    if (error?.code === 'auth/invalid-email') {
      throw new HttpsError('invalid-argument', 'Please enter a valid email address.');
    }

    if (error?.code === 'auth/weak-password') {
      throw new HttpsError('invalid-argument', 'Password must be at least 6 characters long.');
    }

    console.error('createStaffUser failed:', error);
    throw new HttpsError('internal', 'Failed to create staff user. Please try again.');
  }
});
