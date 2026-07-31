import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddUpdateModal from '@/components/features/projects/AddUpdateModal';
import ProjectTimeline from '@/components/features/projects/ProjectTimeline';
import { ProjectDetailSection } from '@/components/features/projects/ProjectDetailField';

export default function ProjectUpdates({
  updates = [],
  attachments = [],
  userId = '',
  canAddUpdate = false,
  onAddUpdate,
  onEditComment,
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <ProjectDetailSection title="Updates & Timeline">
      {canAddUpdate ? (
        <div className="flex justify-end">
          <Button icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add Update
          </Button>
        </div>
      ) : null}

      <ProjectTimeline
        updates={updates}
        attachments={attachments}
        userId={userId}
        onEditComment={onEditComment}
      />

      <AddUpdateModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={onAddUpdate}
      />
    </ProjectDetailSection>
  );
}
