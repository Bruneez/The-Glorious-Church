import { COLLECTIONS } from '@/config/collections';
import { buildSchoolPayload, buildSchoolUpdatePayload } from '@/config/schoolsOptions';
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
    ? data.filter((school) => school.schoolType === schoolType)
    : data;

  return { data: filtered, loading, error };
}

export async function createSchoolRecord(formData, createdBy) {
  return addDocument(COLLECTIONS.SCHOOLS, buildSchoolPayload(formData, createdBy));
}

export async function updateSchoolRecord(schoolId, formData) {
  return updateDocument(COLLECTIONS.SCHOOLS, schoolId, buildSchoolUpdatePayload(formData));
}

export async function deleteSchoolRecord(schoolId) {
  return deleteDocument(COLLECTIONS.SCHOOLS, schoolId);
}
