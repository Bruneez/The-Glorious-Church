import { COLLECTIONS } from '@/config/collections';
import { MEMBER_STATUS, buildMemberPayload, getMemberFullName } from '@/config/memberOptions';
import {
  syncMemberModuleMemberships,
  cleanupMemberModuleMemberships,
} from '@/services/memberMembershipService';
import {
  createMemberAddedNotification,
  createMemberStatusChangedNotification,
} from '@/services/notificationService';
import {
  deleteMemberPhoto,
  deleteMemberReportCard,
} from '@/services/storageService';
import {
  resolveMemberPhotoStoragePath,
  resolveMemberReportCardStoragePath,
} from '@/utils/storagePathUtils';
import { storage } from '@/config/firebase';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  useCollection,
  useDocument,
} from '@/hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

const MEMBER_STORAGE_CLEANUP_LOG = '[Member Storage Cleanup]';

async function cleanupMemberStoragePath(path, deleteFn, label) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath) return null;

  console.info(`${MEMBER_STORAGE_CLEANUP_LOG} deleting:`, {
    label,
    path: normalizedPath,
    bucket: storage?.app?.options?.storageBucket || '',
  });

  try {
    await deleteFn(normalizedPath);
    console.info(`${MEMBER_STORAGE_CLEANUP_LOG} deleted:`, {
      label,
      path: normalizedPath,
    });
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      console.info(`${MEMBER_STORAGE_CLEANUP_LOG} failed:`, {
        label,
        path: normalizedPath,
        code: error.code,
        message: error.message,
      });
      return null;
    }

    console.warn(`${MEMBER_STORAGE_CLEANUP_LOG} failed:`, {
      label,
      path: normalizedPath,
      code: error?.code || 'unknown',
      message: error?.message || 'Unknown storage delete error',
    });

    return `The previous ${label} could not be removed from storage. Please contact an administrator if this persists.`;
  }
}

async function cleanupReplacedMemberFiles(existingMember, payload, memberData = {}) {
  const warnings = [];
  const previousPhotoPath = String(
    memberData.previousProfileImagePath
    || resolveMemberPhotoStoragePath(existingMember)
    || '',
  ).trim();
  const nextPhotoPath = String(payload.profileImagePath || '').trim();
  const previousReportCardPath = String(
    memberData.previousReportCardPath
    || resolveMemberReportCardStoragePath(existingMember)
    || '',
  ).trim();
  const nextReportCardPath = String(payload.reportCardPath || '').trim();

  console.info(`${MEMBER_STORAGE_CLEANUP_LOG} compare photo paths:`, {
    previousProfileImagePath: previousPhotoPath,
    newProfileImagePath: nextPhotoPath,
  });

  if (previousPhotoPath && previousPhotoPath !== nextPhotoPath) {
    const warning = await cleanupMemberStoragePath(
      previousPhotoPath,
      deleteMemberPhoto,
      'profile photo',
    );
    if (warning) warnings.push(warning);
  }

  console.info(`${MEMBER_STORAGE_CLEANUP_LOG} compare report card paths:`, {
    previousReportCardPath,
    newReportCardPath: nextReportCardPath,
  });

  if (previousReportCardPath && previousReportCardPath !== nextReportCardPath) {
    const warning = await cleanupMemberStoragePath(
      previousReportCardPath,
      deleteMemberReportCard,
      'report card',
    );
    if (warning) warnings.push(warning);
  }

  return warnings;
}

export function useMembers(filters = {}) {
  const constraints = [];

  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }

  if (filters.department) {
    constraints.push(where('department', '==', filters.department));
  }

  if (constraints.length > 0) {
    constraints.push(orderBy('name', 'asc'));
  }

  return useCollection(COLLECTIONS.MEMBERS, constraints.length ? { constraints } : {});
}

export function useMember(memberId) {
  return useDocument(COLLECTIONS.MEMBERS, memberId);
}

export async function getMembers(filters = {}) {
  const constraints = [];

  if (filters.department) {
    constraints.push(where('department', '==', filters.department));
  }

  constraints.push(orderBy('name', 'asc'));

  return getDocuments(COLLECTIONS.MEMBERS, constraints);
}

export async function getMember(memberId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.MEMBERS, memberId);
}

export async function createMember(memberData, createdBy = '') {
  const timestamp = new Date().toISOString();
  const payload = buildMemberPayload(memberData);

  const createdMember = await addDocument(COLLECTIONS.MEMBERS, {
    ...payload,
    status: payload.status || MEMBER_STATUS.ACTIVE,
    createdBy: String(createdBy || memberData.createdBy || '').trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await syncMemberModuleMemberships(createdMember.id, null, payload);

  await createMemberAddedNotification({
    memberId: createdMember.id,
    memberName: getMemberFullName(createdMember),
    department: createdMember.department || '',
    departmentId: createdMember.departmentId || '',
    excludeStaffId: String(createdBy || '').trim(),
  }).catch((error) => {
    console.error('Failed to create member added notification:', error);
  });

  return createdMember;
}

export async function updateMember(memberId, memberData) {
  const existingMember = await getMember(memberId);
  const payload = buildMemberPayload(memberData, memberData.status);

  console.info(`${MEMBER_STORAGE_CLEANUP_LOG} updateMember payload paths:`, {
    previousProfileImagePath: memberData.previousProfileImagePath || existingMember?.profileImagePath || '',
    newProfileImagePath: payload.profileImagePath || '',
    existingPhoto: existingMember?.photo || '',
  });

  const updatedMember = await updateDocument(COLLECTIONS.MEMBERS, memberId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  await syncMemberModuleMemberships(memberId, existingMember, payload);

  const storageWarnings = await cleanupReplacedMemberFiles(
    existingMember,
    payload,
    memberData,
  );

  const previousStatus = existingMember?.status;
  const nextStatus = payload.status;

  if (existingMember && previousStatus && nextStatus && previousStatus !== nextStatus) {
    await createMemberStatusChangedNotification({
      memberId,
      memberName: getMemberFullName({ ...existingMember, ...payload }),
      newStatus: nextStatus,
      department: payload.department || existingMember.department || '',
      departmentId: payload.departmentId || existingMember.departmentId || '',
    }).catch((error) => {
      console.error('Failed to create member status notification:', error);
    });
  }

  return { member: updatedMember, storageWarnings };
}

export async function deleteMember(memberId) {
  const existingMember = await getMember(memberId);
  if (!existingMember) {
    throw new Error('Member not found.');
  }

  const profileImagePath = resolveMemberPhotoStoragePath(existingMember);
  const reportCardPath = resolveMemberReportCardStoragePath(existingMember);

  console.info(`${MEMBER_STORAGE_CLEANUP_LOG} deleteMember captured paths:`, {
    memberId,
    profileImagePath,
    reportCardPath,
    bucket: storage?.app?.options?.storageBucket || '',
  });

  await deleteDocument(COLLECTIONS.MEMBERS, memberId);

  await cleanupMemberModuleMemberships(memberId, existingMember);

  const storageWarnings = [];

  const photoWarning = await cleanupMemberStoragePath(
    profileImagePath,
    deleteMemberPhoto,
    'profile photo',
  );
  if (photoWarning) storageWarnings.push(photoWarning);

  const reportCardWarning = await cleanupMemberStoragePath(
    reportCardPath,
    deleteMemberReportCard,
    'report card',
  );
  if (reportCardWarning) storageWarnings.push(reportCardWarning);

  return { memberId, storageWarnings };
}

export function filterMembers(members, searchTerm) {
  if (!searchTerm) return members;

  const term = searchTerm.toLowerCase();
  return members.filter((member) =>
    member.firstName?.toLowerCase().includes(term) ||
    member.lastName?.toLowerCase().includes(term) ||
    member.fullName?.toLowerCase().includes(term) ||
    member.name?.toLowerCase().includes(term) ||
    member.surname?.toLowerCase().includes(term) ||
    getMemberFullName(member).toLowerCase().includes(term) ||
    member.phone?.toLowerCase().includes(term) ||
    member.church?.toLowerCase().includes(term) ||
    member.branch?.toLowerCase().includes(term) ||
    member.zoneSupervisor?.toLowerCase().includes(term) ||
    member.cellLeader?.toLowerCase().includes(term) ||
    member.creativeArtsName?.toLowerCase().includes(term) ||
    member.ministryName?.toLowerCase().includes(term) ||
    member.department?.toLowerCase().includes(term) ||
    member.creativeArts?.toLowerCase().includes(term) ||
    member.occupation?.toLowerCase().includes(term) ||
    member.homeAddress?.toLowerCase().includes(term) ||
    member.address?.toLowerCase().includes(term) ||
    member.school?.toLowerCase().includes(term) ||
    member.schoolName?.toLowerCase().includes(term) ||
    member.universityName?.toLowerCase().includes(term) ||
    member.collegeName?.toLowerCase().includes(term) ||
    member.institution?.toLowerCase().includes(term) ||
    member.grade?.toLowerCase().includes(term) ||
    member.course?.toLowerCase().includes(term)
  );
}
