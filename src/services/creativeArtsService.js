import { COLLECTIONS } from '@/config/collections';
import { DEFAULT_DEPARTMENTS, buildDepartmentPayload } from '@/config/creativeArtsOptions';
import { deleteCreativeArtsImage } from '@/services/storageService';
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  useCollection,
  useDocument,
} from '@/hooks/useFirestore';
import { orderBy } from 'firebase/firestore';

async function cleanupDepartmentLogo(logoPath) {
  if (!logoPath) return;

  try {
    await deleteCreativeArtsImage(logoPath);
  } catch (error) {
    console.warn('Failed to delete department logo from storage:', error);
  }
}

export function useCreativeArts() {
  return useCollection(COLLECTIONS.CREATIVE_ARTS, {
    constraints: [orderBy('name', 'asc')],
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
  const payload = buildDepartmentPayload(teamData);

  return addDocument(COLLECTIONS.CREATIVE_ARTS, {
    ...payload,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function updateCreativeArtsTeam(teamId, teamData, initialData = null) {
  const payload = buildDepartmentPayload(teamData, initialData);

  if (teamData.removeLogo) {
    await cleanupDepartmentLogo(initialData?.logoPath);
  } else if (
    payload.logoPath &&
    initialData?.logoPath &&
    payload.logoPath !== initialData.logoPath
  ) {
    await cleanupDepartmentLogo(initialData.logoPath);
  }

  return updateDocument(COLLECTIONS.CREATIVE_ARTS, teamId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCreativeArtsTeam(teamId) {
  return deleteDocument(COLLECTIONS.CREATIVE_ARTS, teamId);
}

export async function seedDefaultDepartmentsIfEmpty() {
  const existing = await getCreativeArts();
  if (existing.length > 0) {
    return existing;
  }

  for (const department of DEFAULT_DEPARTMENTS) {
    await createCreativeArtsTeam(department);
  }

  return getCreativeArts();
}

export async function addMemberToTeam(teamId, memberId) {
  const team = await getCreativeArtsTeam(teamId);
  const members = team.members || [];
  if (!members.includes(memberId)) {
    members.push(memberId);
    return updateDocument(COLLECTIONS.CREATIVE_ARTS, teamId, {
      members,
      updatedAt: new Date().toISOString(),
    });
  }
  return team;
}

export async function removeMemberFromTeam(teamId, memberId) {
  const team = await getCreativeArtsTeam(teamId);
  const members = (team.members || []).filter((id) => id !== memberId);
  return updateDocument(COLLECTIONS.CREATIVE_ARTS, teamId, {
    members,
    updatedAt: new Date().toISOString(),
  });
}
