import { COLLECTIONS } from '@/config/collections';
import { MEMBER_STATUS, buildMemberPayload } from '@/config/memberOptions';
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

export async function createMember(memberData) {
  const timestamp = new Date().toISOString();
  const payload = buildMemberPayload(memberData);

  return addDocument(COLLECTIONS.MEMBERS, {
    ...payload,
    status: payload.status || MEMBER_STATUS.ACTIVE,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function updateMember(memberId, memberData) {
  const payload = buildMemberPayload(memberData, memberData.status);

  return updateDocument(COLLECTIONS.MEMBERS, memberId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteMember(memberId) {
  return deleteDocument(COLLECTIONS.MEMBERS, memberId);
}

export function filterMembers(members, searchTerm) {
  if (!searchTerm) return members;

  const term = searchTerm.toLowerCase();
  return members.filter((member) =>
    member.name?.toLowerCase().includes(term) ||
    member.surname?.toLowerCase().includes(term) ||
    member.phone?.toLowerCase().includes(term) ||
    member.department?.toLowerCase().includes(term) ||
    member.creativeArts?.toLowerCase().includes(term) ||
    member.occupation?.toLowerCase().includes(term) ||
    member.school?.toLowerCase().includes(term) ||
    member.institution?.toLowerCase().includes(term) ||
    member.grade?.toLowerCase().includes(term) ||
    member.course?.toLowerCase().includes(term)
  );
}
