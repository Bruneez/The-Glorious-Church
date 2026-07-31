import ProjectForm from '@/components/features/projects/ProjectForm';

export default function EditProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project = null,
  staff = [],
}) {
  return (
    <ProjectForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={project}
      staff={staff}
      mode="edit"
    />
  );
}
