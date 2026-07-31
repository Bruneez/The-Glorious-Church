import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { ProjectDetailSection } from '@/components/features/projects/ProjectDetailField';
import { PROJECT_STATUS_OPTIONS } from '@/config/projectsOptions';

export default function ProjectProgress({
  project,
  canManageProgress = false,
  onSaveProgress,
  onSaveStatus,
}) {
  const [progressValue, setProgressValue] = useState('0');
  const [statusValue, setStatusValue] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (!project) return;

    const progress = Math.min(100, Math.max(0, project.progressValue ?? project.progress ?? 0));
    setProgressValue(String(progress));
    setStatusValue(project.status || '');
    setProgressError('');
    setStatusError('');
  }, [project]);

  if (!project) return null;

  const progress = Math.min(100, Math.max(0, project.progressValue ?? project.progress ?? 0));
  const progressChanged = Number(progressValue) !== progress;
  const statusChanged = statusValue !== project.status;

  const handleSaveProgress = async () => {
    setProgressError('');
    setIsSavingProgress(true);

    try {
      await onSaveProgress(Number(progressValue));
    } catch (error) {
      setProgressError(error?.message || 'Failed to update progress.');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleSaveStatus = async () => {
    setStatusError('');
    setIsSavingStatus(true);

    try {
      await onSaveStatus(statusValue);
    } catch (error) {
      setStatusError(error?.message || 'Failed to update status.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <ProjectDetailSection title="Progress">
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-300">Overall Progress</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>

          <div
            className="h-3 rounded-full bg-slate-800 border border-slate-700/70 overflow-hidden"
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

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Current Status
            </p>
            <p className="text-sm font-medium text-white mt-1">{project.statusLabel || project.status}</p>
          </div>

          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Priority
            </p>
            <p className="text-sm font-medium text-white mt-1">{project.priorityLabel || 'Medium'}</p>
          </div>
        </div>

        {canManageProgress ? (
          <div className="space-y-4 pt-2 border-t border-slate-700/60">
            <div className="space-y-2">
              <Input
                label="Update Progress (%)"
                type="number"
                min={0}
                max={100}
                value={progressValue}
                onChange={(event) => {
                  setProgressValue(event.target.value);
                  setProgressError('');
                }}
              />
              {progressError ? (
                <p role="alert" className="text-rose-400 text-[10px]">{progressError}</p>
              ) : null}
              <Button
                type="button"
                onClick={handleSaveProgress}
                disabled={!progressChanged || isSavingProgress}
                className="w-full sm:w-auto"
              >
                {isSavingProgress ? 'Saving...' : 'Save Progress'}
              </Button>
            </div>

            <div className="space-y-2">
              <Select
                label="Operational Status"
                name="projectStatus"
                value={statusValue}
                onChange={(event) => {
                  setStatusValue(event.target.value);
                  setStatusError('');
                }}
                options={PROJECT_STATUS_OPTIONS}
              />
              {statusError ? (
                <p role="alert" className="text-rose-400 text-[10px]">{statusError}</p>
              ) : null}
              <Button
                type="button"
                onClick={handleSaveStatus}
                disabled={!statusChanged || isSavingStatus}
                className="w-full sm:w-auto"
              >
                {isSavingStatus ? 'Saving...' : 'Save Status'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </ProjectDetailSection>
  );
}
