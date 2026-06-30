import { COLLECTIONS } from '@/config/collections';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  useCollection,
  useDocument
} from '@/hooks/useFirestore';
import { where, orderBy, query } from 'firebase/firestore';

export function useMembers(filters = {}) {
  const constraints = [];

  if (filters.group) {
    constraints.push(where('group', '==', filters.group));
  }

  if (filters.creativeArts) {
    constraints.push(where('creativeArts', '==', filters.creativeArts));
  }

  if (filters.school) {
    constraints.push(where('school', '==', filters.school));
  }

  if (filters.campus) {
    constraints.push(where('campus', '==', filters.campus));
  }

  constraints.push(orderBy('name', 'asc'));

  return useCollection(COLLECTIONS.MEMBERS, { constraints });
}

export function useMember(memberId) {
  return useDocument(COLLECTIONS.MEMBERS, memberId);
}

export async function getMembers(filters = {}) {
  const constraints = [];

  if (filters.group) {
    constraints.push(where('group', '==', filters.group));
  }

  if (filters.creativeArts) {
    constraints.push(where('creativeArts', '==', filters.creativeArts));
  }

  if (filters.school) {
    constraints.push(where('school', '==', filters.school));
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
  return addDocument(COLLECTIONS.MEMBERS, {
    ...memberData,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateMember(memberId, memberData) {
  return updateDocument(COLLECTIONS.MEMBERS, memberId, {
    ...memberData,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteMember(memberId) {
  return deleteDocument(COLLECTIONS.MEMBERS, memberId);
}

export async function searchMembers(searchTerm) {
  const members = await getMembers();
  const term = searchTerm.toLowerCase();
  return members.filter(member => 
    member.name?.toLowerCase().includes(term) ||
    member.phone?.toLowerCase().includes(term) ||
    member.email?.toLowerCase().includes(term) ||
    member.group?.toLowerCase().includes(term)
  );
}
