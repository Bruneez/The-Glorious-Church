import {
  getProjectCategoryLabel,
  getProjectJoiningMethodLabel,
  getProjectPriorityBadgeClass,
  getProjectStatusBadgeClass,
} from '@/config/projectsDisplay';
import { formatDate } from '@/utils/formatters';
import ProjectDetailField, { ProjectDetailSection } from '@/components/features/projects/ProjectDetailField';

function formatProjectTimestamp(value) {
  if (!value) return '—';

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return formatDate(date.toISOString(), 'short');
}

export default function ProjectInformation({ project }) {
  if (!project) return null;

  return (
    <ProjectDetailSection title="Project Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ProjectDetailField label="Status">
          <span
            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getProjectStatusBadgeClass(project.status)}`}
          >
            {project.statusLabel || project.status}
          </span>
        </ProjectDetailField>

        <ProjectDetailField label="Priority">
          <span
            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getProjectPriorityBadgeClass(project.priority)}`}
          >
            {project.priorityLabel || 'Medium'}
          </span>
        </ProjectDetailField>

        <ProjectDetailField label="Joining Method" value={getProjectJoiningMethodLabel(project)} />
        <ProjectDetailField label="Category" value={getProjectCategoryLabel(project.category)} />
        <ProjectDetailField label="Project Leader" value={project.leaderName || 'Unassigned'} />
        <ProjectDetailField label="Creator" value={project.createdByName || '—'} />
        <ProjectDetailField
          label="Start Date"
          value={project.startDate ? formatDate(project.startDate, 'short') : '—'}
        />
        <ProjectDetailField
          label="Due Date"
          value={project.dueDateText ? formatDate(project.dueDateText, 'short') : '—'}
        />
        <ProjectDetailField label="Created" value={formatProjectTimestamp(project.createdAt)} />
        <ProjectDetailField
          label="Participants"
          value={String(project.memberCountValue ?? project.memberCount ?? 0)}
        />
      </div>

      <ProjectDetailField label="Description">
        <p className="text-sm text-slate-300 font-normal leading-relaxed whitespace-pre-wrap">
          {project.description || '—'}
        </p>
      </ProjectDetailField>

      <ProjectDetailField label="Expected Outcome">
        <p className="text-sm text-slate-300 font-normal leading-relaxed whitespace-pre-wrap">
          {project.expectedOutcome || '—'}
        </p>
      </ProjectDetailField>
    </ProjectDetailSection>
  );
}
