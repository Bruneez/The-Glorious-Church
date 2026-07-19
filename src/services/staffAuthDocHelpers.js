export function getStaffAuthUid(staffData = {}) {
  return String(staffData.uid || staffData.authUid || '').trim();
}

export function isStaffDocAtAuthUid(staffDocId, staffData = {}) {
  const authUid = getStaffAuthUid(staffData) || String(staffDocId || '').trim();
  return Boolean(authUid && staffDocId === authUid);
}

export function buildStaffAuthDocPayload(staffData, authUid) {
  const normalizedUid = String(authUid || '').trim();
  if (!normalizedUid) {
    throw new Error('Auth UID is required for staff document migration.');
  }

  return {
    ...staffData,
    uid: normalizedUid,
    authUid: normalizedUid,
  };
}
