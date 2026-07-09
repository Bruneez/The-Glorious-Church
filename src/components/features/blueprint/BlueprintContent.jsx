import BlueprintSection from '@/components/features/blueprint/BlueprintSection';

export default function BlueprintContent({ sectionViewModel }) {
  return (
    <section aria-live="polite" className="w-full min-h-[320px]">
      <BlueprintSection section={sectionViewModel} />
    </section>
  );
}
