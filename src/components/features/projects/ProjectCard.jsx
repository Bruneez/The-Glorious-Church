import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  FolderKanban,
  ImageOff,
  Users,
} from 'lucide-react';
import ProjectMembershipActions from '@/components/features/projects/ProjectMembershipActions';
import {
  getProjectCoverUrl,
  getProjectPriorityBadgeClass,
  getProjectStatusBadgeClass,
} from '@/config/projectsDisplay';
import { formatDate } from '@/utils/formatters';
export function ProjectCoverImage({ project, className = '' }) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getProjectCoverUrl(project);

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 border-b border-slate-700/70 ${className}`}
        role="img"
        aria-label={`${project.title || 'Project'} cover`}
      >
        <div className="text-center px-3 py-6">
          <ImageOff className="w-7 h-7 text-slate-600 mx-auto mb-1.5" aria-hidden="true" />
          <p className="text-[10px] text-slate-500 font-medium">No cover image</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${project.title || 'Project'} cover`}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover bg-slate-800 border-b border-slate-700/70 ${className}`}
    />
  );
}

export default function ProjectCard({
  project,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  membershipActionLoading = false,
  onMembershipAction,
}) {
  const progress = Math.min(100, Math.max(0, project.progressValue ?? project.progress ?? 0));

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/50 shadow-sm transition hover:border-indigo-500/40 hover:bg-slate-900/70 min-w-0">
      <Link to={`/projects/${project.id}`} className="relative block">
        <ProjectCoverImage project={project} className="aspect-[16/9] w-full" />

        {project.overdue ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-300">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Overdue
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 min-w-0">
        <div className="space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <Link
              to={`/projects/${project.id}`}
              className="min-w-0 text-sm font-bold text-white leading-snug line-clamp-2 hover:text-indigo-300 transition"
            >
              {project.title || 'Untitled Project'}
            </Link>
            <span
              className={`shrink-0 inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getProjectPriorityBadgeClass(project.priority)}`}
            >
              {project.priorityLabel || 'Medium'}
            </span>
          </div>

          <p className="text-[11px] text-indigo-400/90 font-medium truncate">
            Leader: {project.leaderName || 'Unassigned'}
          </p>
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
        </div>

        {project.summaryText ? (
          <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
            {project.summaryText}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 italic">No summary provided.</p>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            <span>Progress</span>
            <span className="text-slate-300">{progress}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-slate-800 border border-slate-700/70 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.title || 'Project'} progress`}
          >
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Due Date
            </p>
            <p className="text-[11px] font-medium text-slate-200 mt-1 flex items-center gap-1.5 truncate">
              <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
              {project.dueDateText ? formatDate(project.dueDateText, 'short') : '—'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Members
            </p>
            <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
              {project.memberCountValue ?? project.memberCount ?? 0}
            </p>
          </div>
        </div>

        {project.tileState || canEdit || canDelete ? (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/60">
            {project.tileState ? (
              <ProjectMembershipActions
                project={project}
                tileState={project.tileState}
                loading={membershipActionLoading}
                onAction={onMembershipAction}
              />
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1 ml-auto">
              {canEdit && onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit
                </button>
              ) : null}
              {canDelete && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(project)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-slate-700/70 bg-slate-900/40 overflow-hidden animate-pulse min-h-[24rem]"
      aria-hidden="true"
    >
      <div className="aspect-[16/9] bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
        <div className="h-12 rounded bg-slate-800" />
        <div className="h-2 rounded bg-slate-800" />
      </div>
    </div>
  );
}

export function ProjectGridEmptyState({ hasFilters = false }) {
  return (
    <div className="py-14 px-6 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
      <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2" aria-hidden="true" />
      <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
        {hasFilters
          ? 'No projects match your search or filters.'
          : 'No projects have been created yet.'}
      </p>
    </div>
  );
}
