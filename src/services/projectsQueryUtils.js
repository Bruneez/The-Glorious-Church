import { orderBy, where } from 'firebase/firestore';
import { isProjectDeleted } from '../config/projectsOptions.js';
import { canViewProject } from './projectGuards.js';

export function getProjectsQueryConstraints() {
  return [orderBy('updatedAt', 'desc')];
}

export function sortProjects(projects = []) {
  return [...projects].sort((left, right) => {
    const leftTime = left.updatedAt?.toDate?.()?.getTime?.()
      || Date.parse(left.updatedAt || 0)
      || 0;
    const rightTime = right.updatedAt?.toDate?.()?.getTime?.()
      || Date.parse(right.updatedAt || 0)
      || 0;
    return rightTime - leftTime;
  });
}

export function normalizeProjects(projects = [], role, userId = '') {
  return sortProjects(
    projects.filter((project) => {
      if (isProjectDeleted(project)) return false;
      return canViewProject(role, project, userId);
    }),
  );
}

export function getProjectMembershipsQueryConstraints(projectId) {
  return [
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc'),
  ];
}

export function getProjectMembershipsByUserQueryConstraints(userId) {
  return [
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
  ];
}

export function getProjectUpdatesQueryConstraints(projectId) {
  return [
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc'),
  ];
}

export function getProjectAttachmentsQueryConstraints(projectId) {
  return [
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc'),
  ];
}
