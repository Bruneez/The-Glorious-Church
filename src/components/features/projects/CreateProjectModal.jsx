import ProjectForm from '@/components/features/projects/ProjectForm';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  staff = [],
}) {
  return (
    <ProjectForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      staff={staff}
      mode="create"
    />
  );
}
