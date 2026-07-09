import { COLLECTIONS } from '@/config/collections';
import { MEMBER_STATUS, buildMemberPayload, getMemberFullName } from '@/config/memberOptions';
import {
  createMemberAddedNotification,
  createMemberStatusChangedNotification,
} from '@/services/notificationService';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  useCollection,
  useDocument,
} from '@/hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

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

  const updatedMember = await updateDocument(COLLECTIONS.MEMBERS, memberId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });

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

  return updatedMember;
}

export async function deleteMember(memberId) {
  return deleteDocument(COLLECTIONS.MEMBERS, memberId);
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
