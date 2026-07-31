import ProjectCard, { ProjectCardSkeleton, ProjectGridEmptyState } from '@/components/features/projects/ProjectCard';
import ProjectEmptyState from '@/components/features/projects/ProjectEmptyState';

export default function ProjectsGrid({
  projects = [],
  loading = false,
  hasFilters = false,
  canCreateProject = false,
  onCreateProject,
  canEditProject,
  onEditProject,
  canDeleteProject,
  onDeleteProject,
  membershipActionProjectId = '',
  onMembershipAction,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <ProjectCardSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (!projects.length) {
    if (hasFilters) {
      return <ProjectGridEmptyState hasFilters />;
    }

    return (
      <ProjectEmptyState
        canCreateProject={canCreateProject}
        onCreateProject={onCreateProject}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          canEdit={typeof canEditProject === 'function' ? canEditProject(project) : false}
          canDelete={typeof canDeleteProject === 'function' ? canDeleteProject(project) : false}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          membershipActionLoading={membershipActionProjectId === project.id}
          onMembershipAction={onMembershipAction}
        />
      ))}
    </div>
  );
}
