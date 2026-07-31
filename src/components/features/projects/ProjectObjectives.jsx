import { CheckCircle2, Circle } from 'lucide-react';
import { ProjectDetailSection } from '@/components/features/projects/ProjectDetailField';

export default function ProjectObjectives({ project }) {
  const objectives = Array.isArray(project?.objectives) ? project.objectives : [];

  return (
    <ProjectDetailSection title="Objectives">
      {objectives.length ? (
        <ul className="space-y-2">
          {objectives.map((objective) => (
            <li
              key={objective.id || objective.text}
              className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-900/50 px-3.5 py-3 min-w-0"
            >
              {objective.completed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" aria-hidden="true" />
              )}
              <span
                className={`text-sm leading-relaxed break-words ${
                  objective.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                }`}
              >
                {objective.text}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/30 px-4 py-6 text-center">
          <p className="text-xs text-slate-500">No objectives have been added yet.</p>
        </div>
      )}
    </ProjectDetailSection>
  );
}
