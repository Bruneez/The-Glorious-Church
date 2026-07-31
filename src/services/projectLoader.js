import { COLLECTIONS } from '../config/collections.js';
import { isProjectDeleted } from '../config/projectsOptions.js';
import { getDocument } from '../hooks/useFirestore.js';
import {
  assertCanViewProject,
  assertCanViewProjects,
} from './projectGuards.js';

export async function loadProject(projectId, { role, userId = '' } = {}) {
  assertCanViewProjects(role);

  if (!projectId) {
    throw new Error('Project ID is required.');
  }

  const project = await getDocument(COLLECTIONS.PROJECTS, projectId);
  if (!project || isProjectDeleted(project)) {
    throw new Error('Project not found.');
  }

  assertCanViewProject(role, project, userId);
  return project;
}
