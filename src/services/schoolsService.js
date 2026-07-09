import { COLLECTIONS } from '@/config/collections';
import { buildSchoolPayload, buildSchoolUpdatePayload, schoolMatchesTypeFilter } from '@/config/schoolsOptions';
import { deleteSchoolLogo } from '@/services/storageService';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  useCollection,
  useDocument
} from '@/hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

async function cleanupSchoolBadge(badgePath) {
  if (!badgePath) return;

  try {
    await deleteSchoolLogo(badgePath);
  } catch (error) {
    console.warn('Failed to delete school badge from storage:', error);
  }
}

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
  return addDocument(COLLECTIONS.SCHOOLS, buildSchoolPayload(formData, createdBy));
}

export async function updateSchoolRecord(schoolId, formData, initialData = null) {
  const payload = buildSchoolUpdatePayload(formData, initialData);

  if (formData.removeBadge) {
    await cleanupSchoolBadge(initialData?.badgePath);
  } else if (
    payload.badgePath &&
    initialData?.badgePath &&
    payload.badgePath !== initialData.badgePath
  ) {
    await cleanupSchoolBadge(initialData.badgePath);
  }

  return updateDocument(COLLECTIONS.SCHOOLS, schoolId, payload);
}

export async function deleteSchoolRecord(schoolId) {
  return deleteDocument(COLLECTIONS.SCHOOLS, schoolId);
}
