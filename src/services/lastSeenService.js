import { updateStaffProfile } from '@/services/staffService';

const THROTTLE_MS = 2 * 60 * 1000;
let lastRecordedAt = 0;

export async function recordStaffLastSeen(staffDocId, { force = false } = {}) {
  if (!staffDocId) return;

  const now = Date.now();
  if (!force && now - lastRecordedAt < THROTTLE_MS) {
    return;
  }

  lastRecordedAt = now;

  await updateStaffProfile(staffDocId, {
    lastSeenAt: new Date().toISOString(),
  });
}
