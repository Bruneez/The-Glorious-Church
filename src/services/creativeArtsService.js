import { COLLECTIONS } from '@/config/collections';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  useCollection,
  useDocument
} from '@/hooks/useFirestore';
import { orderBy } from 'firebase/firestore';

export function useCreativeArts() {
  return useCollection(COLLECTIONS.CREATIVE_ARTS, {
    constraints: [orderBy('name', 'asc')]
  });
}

export function useCreativeArtsTeam(teamId) {
  return useDocument(COLLECTIONS.CREATIVE_ARTS, teamId);
}

export async function getCreativeArts() {
  return getDocuments(COLLECTIONS.CREATIVE_ARTS, [orderBy('name', 'asc')]);
}

export async function getCreativeArtsTeam(teamId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.CREATIVE_ARTS, teamId);
}

export async function createCreativeArtsTeam(teamData) {
  const timestamp = new Date().toISOString();
  return addDocument(COLLECTIONS.CREATIVE_ARTS, {
    ...teamData,
    members: teamData.members || [],
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateCreativeArtsTeam(teamId, teamData) {
  return updateDocument(COLLECTIONS.CREATIVE_ARTS, teamId, {
    ...teamData,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteCreativeArtsTeam(teamId) {
  return deleteDocument(COLLECTIONS.CREATIVE_ARTS, teamId);
}

export async function addMemberToTeam(teamId, memberId) {
  const team = await getCreativeArtsTeam(teamId);
  const members = team.members || [];
  if (!members.includes(memberId)) {
    members.push(memberId);
    return updateCreativeArtsTeam(teamId, { members });
  }
  return team;
}

export async function removeMemberFromTeam(teamId, memberId) {
  const team = await getCreativeArtsTeam(teamId);
  const members = (team.members || []).filter(id => id !== memberId);
  return updateCreativeArtsTeam(teamId, { members });
}
