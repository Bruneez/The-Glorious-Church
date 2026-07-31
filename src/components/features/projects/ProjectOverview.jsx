import { AlertTriangle, Users } from 'lucide-react';
import { ProjectCoverImage } from '@/components/features/projects/ProjectCard';
import ProjectMembershipActions from '@/components/features/projects/ProjectMembershipActions';
import {
  getProjectPriorityBadgeClass,
  getProjectStatusBadgeClass,
} from '@/config/projectsDisplay';

export default function ProjectOverview({
  project,
  membershipActionLoading = false,
  onMembershipAction,
}) {
  if (!project) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/50 min-w-0">
      <div className="relative">
        <ProjectCoverImage project={project} className="aspect-[21/9] w-full sm:aspect-[16/7]" />

        {project.overdue ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-300">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Overdue
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4 sm:p-5 min-w-0">
        <div className="space-y-3 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
            <div className="min-w-0 space-y-2">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-snug break-words">
                {project.title || 'Untitled Project'}
              </h1>
              <p className="text-sm text-indigo-400/90 font-medium">
                Leader: {project.leaderName || 'Unassigned'}
              </p>
            </div>

            <span
              className={`self-start shrink-0 inline-flex px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${getProjectPriorityBadgeClass(project.priority)}`}
            >
              {project.priorityLabel || 'Medium'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getProjectStatusBadgeClass(project.status)}`}
            >
              {project.statusLabel || project.status}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${project.participation?.badgeClass || ''}`}
            >
              {project.participation?.label || 'Not Joined'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              <Users className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
              {project.memberCountValue ?? project.memberCount ?? 0} participants
            </span>
          </div>
        </div>

        {project.summaryText ? (
          <p className="text-sm text-slate-300 leading-relaxed">{project.summaryText}</p>
        ) : (
          <p className="text-sm text-slate-500 italic">No summary provided.</p>
        )}

        {project.tileState ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ProjectMembershipActions
              project={project}
              tileState={project.tileState}
              loading={membershipActionLoading}
              onAction={onMembershipAction}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
