import ResourceCard from '@/components/features/shepherding-tools/ResourceCard';
import ShepherdingToolsEmptyState from '@/components/features/shepherding-tools/ShepherdingToolsEmptyState';

export default function ShepherdingToolsResourceGrid({
  resources = [],
  emptyMessage,
  showDraftStatus = false,
  onView,
  onOpenExternal,
}) {
  if (!resources.length) {
    return <ShepherdingToolsEmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 min-w-0">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          showDraftStatus={showDraftStatus}
          onView={onView}
          onOpenExternal={onOpenExternal}
        />
      ))}
    </div>
  );
}
