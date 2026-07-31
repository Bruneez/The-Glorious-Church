import { Link } from 'react-router-dom';
import { Settings2, Users } from 'lucide-react';
import {
  getActiveProjectTeamMembers,
  getProjectTeamRoleBadgeClass,
  getProjectTeamRoleLabel,
} from '@/config/projectsDisplay';
import { ProjectDetailSection } from '@/components/features/projects/ProjectDetailField';

export default function ProjectTeam({
  project,
  memberships = [],
  canManageTeam = false,
  onManageTeam,
}) {
  const teamMembers = getActiveProjectTeamMembers(memberships);

  return (
    <ProjectDetailSection
      title="Project Team"
      action={canManageTeam ? (
        <button
          type="button"
          onClick={onManageTeam}
          className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
        >
          <Settings2 className="h-3 w-3" aria-hidden="true" />
          Manage Team
        </button>
      ) : project?.id ? (
        <Link
          to={`/projects/${project.id}/team`}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          View Team
        </Link>
      ) : null}
    >
      {teamMembers.length ? (
        <ul className="space-y-2">
          {teamMembers.map((membership) => (
            <li
              key={membership.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-900/50 px-3.5 py-3 min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <Users className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {membership.memberName || 'Unknown member'}
                  </p>
                  <span className={`inline-flex mt-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getProjectTeamRoleBadgeClass(project, membership)}`}>
                    {getProjectTeamRoleLabel(project, membership)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/30 px-4 py-6 text-center">
          <p className="text-xs text-slate-500">No active team members yet.</p>
        </div>
      )}
    </ProjectDetailSection>
  );
}
