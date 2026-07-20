import { COLLECTIONS } from '@/config/collections';
import {
  buildSchoolPayload,
  buildSchoolUpdatePayload,
  resolvePreviousSchoolBadgePath,
  schoolMatchesTypeFilter,
  shouldCleanupPreviousSchoolBadge,
} from '@/config/schoolsOptions';
import { resolveSchoolBadgeStoragePath } from '@/utils/storagePathUtils';
import { deleteSchoolLogo } from '@/services/storageService';
import {
  cleanupSchoolBadgeStoragePath,
} from '@/services/schoolsStorageLifecycle';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  useCollection,
  useDocument
} from '@/hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

export function useSchools(type = null) {
  const constraints = [];
  
  if (type) {
    constraints.push(where('type', '==', type));
  }
  
  constraints.push(orderBy('name', 'asc'));
  
  return useCollection(COLLECTIONS.CAMPUSES, { constraints });
}

export function useSchool(schoolId) {
  return useDocument(COLLECTIONS.CAMPUSES, schoolId);
}

export async function getSchools(type = null) {
  const constraints = [];
  
  if (type) {
    constraints.push(where('type', '==', type));
  }
  
  constraints.push(orderBy('name', 'asc'));
  
  return getDocuments(COLLECTIONS.CAMPUSES, constraints);
}

export async function getSchool(schoolId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.CAMPUSES, schoolId);
}

export async function createSchool(schoolData) {
  const timestamp = new Date().toISOString();
  return addDocument(COLLECTIONS.CAMPUSES, {
    ...schoolData,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateSchool(schoolId, schoolData) {
  return updateDocument(COLLECTIONS.CAMPUSES, schoolId, {
    ...schoolData,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteSchool(schoolId) {
  return deleteDocument(COLLECTIONS.CAMPUSES, schoolId);
}

export async function getPrimarySchools() {
  return getSchools('primary');
}

export async function getHighSchools() {
  return getSchools('high');
}

export async function getHigherEducation() {
  return getSchools('higher-education');
}

export function useSchoolsDirectory() {
  return useCollection(COLLECTIONS.SCHOOLS, {
    constraints: [orderBy('schoolName', 'asc')],
  });
}

export function useSchoolsByType(schoolType = null) {
  const { data = [], loading, error } = useSchoolsDirectory();

  const filtered = schoolType
    ? data.filter((school) => schoolMatchesTypeFilter(school, schoolType))
    : data;

  return { data: filtered, loading, error };
}

export async function createSchoolRecord(formData, createdBy) {
  const school = await addDocument(COLLECTIONS.SCHOOLS, buildSchoolPayload(formData, createdBy));
  return { school, storageWarnings: [] };
}

export async function getSchoolRecord(schoolId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.SCHOOLS, schoolId);
}

export async function updateSchoolRecord(schoolId, formData, initialData = null) {
  const payload = buildSchoolUpdatePayload(formData, initialData);
  const previousBadgePath = resolvePreviousSchoolBadgePath(formData, initialData);
  const nextBadgePath = String(payload.badgePath || '').trim();

  const updatedSchool = await updateDocument(COLLECTIONS.SCHOOLS, schoolId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  const storageWarnings = [];

  if (shouldCleanupPreviousSchoolBadge(previousBadgePath, nextBadgePath)) {
    const warning = await cleanupSchoolBadgeStoragePath(previousBadgePath, deleteSchoolLogo);
    if (warning) storageWarnings.push(warning);
  }

  return { school: updatedSchool, storageWarnings };
}

export async function deleteSchoolRecord(schoolId) {
  const existingSchool = await getSchoolRecord(schoolId);
  if (!existingSchool) {
    throw new Error('School not found.');
  }

  const badgePath = resolveSchoolBadgeStoragePath(existingSchool);

  await deleteDocument(COLLECTIONS.SCHOOLS, schoolId);

  const storageWarnings = [];
  const warning = await cleanupSchoolBadgeStoragePath(badgePath, deleteSchoolLogo);
  if (warning) storageWarnings.push(warning);

  return { schoolId, storageWarnings };
}
