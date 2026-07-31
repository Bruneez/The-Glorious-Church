import { FolderKanban, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  PROJECTS_CREATE_BUTTON_LABEL,
  PROJECTS_EMPTY_STATE,
} from '@/config/projectsOptions';

export default function ProjectEmptyState({
  canCreateProject = false,
  onCreateProject,
}) {
  return (
    <div className="py-14 px-6 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
        <FolderKanban className="h-7 w-7 text-slate-500" aria-hidden="true" />
      </div>
      <h2 className="text-sm font-semibold text-white">{PROJECTS_EMPTY_STATE.title}</h2>
      <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed mt-2">
        {PROJECTS_EMPTY_STATE.description}
      </p>
      {canCreateProject ? (
        <div className="mt-5 flex justify-center">
          <Button icon={Plus} onClick={onCreateProject}>
            {PROJECTS_CREATE_BUTTON_LABEL}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
