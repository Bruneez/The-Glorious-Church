import BlueprintCard from '@/components/features/blueprint/BlueprintCard';

export default function BlueprintNavigation({
  sections = [],
  selectedSectionId,
  onSelect,
}) {
  return (
    <nav aria-label="Blueprint sections" className="w-full">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 list-none p-0 m-0">
        {sections.map((section) => (
          <li key={section.id}>
            <BlueprintCard
              section={section}
              isSelected={section.id === selectedSectionId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
