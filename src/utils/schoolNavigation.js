export function buildSchoolDetailUrl(schoolId) {
  const id = String(schoolId || '').trim();
  if (!id) return '/schools';

  return `/schools?schoolId=${encodeURIComponent(id)}`;
}

export function findSchoolById(schools = [], schoolId) {
  const id = String(schoolId || '').trim();
  if (!id) return null;

  return schools.find((school) => school.id === id) || null;
}

export function shouldOpenSchoolFromDeepLink({
  schoolId,
  loading = false,
  schools = [],
  viewingSchoolId = null,
} = {}) {
  const id = String(schoolId || '').trim();
  if (!id || loading) return false;
  if (viewingSchoolId === id) return false;

  return Boolean(findSchoolById(schools, id));
}

export function shouldShowSchoolNotFoundFeedback({
  schoolId,
  loading = false,
  schools = [],
} = {}) {
  const id = String(schoolId || '').trim();
  if (!id || loading) return false;

  return !findSchoolById(schools, id);
}

export function removeSchoolIdSearchParam(searchParams) {
  const nextParams = new URLSearchParams(searchParams);
  nextParams.delete('schoolId');
  return nextParams;
}
