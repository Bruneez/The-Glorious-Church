import { useMemo, useState } from 'react';
import BlueprintNavigation from '@/components/features/blueprint/BlueprintNavigation';
import BlueprintContent from '@/components/features/blueprint/BlueprintContent';
import {
  BLUEPRINT_META,
  BLUEPRINT_SECTIONS,
  DEFAULT_BLUEPRINT_SECTION_ID,
  getBlueprintPlannedContentMeta,
  getBlueprintSection,
  parseBlueprintPlaceholderContent,
  resolveBlueprintContentBlocks,
} from '@/config/blueprintConfig';

function buildSectionViewModel(section) {
  if (!section) {
    return null;
  }

  return {
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    paragraphs: parseBlueprintPlaceholderContent(section.placeholderContent),
    contentBlocks: resolveBlueprintContentBlocks(section),
    plannedContent: getBlueprintPlannedContentMeta(section),
  };
}

export default function BlueprintPage() {
  const [selectedSectionId, setSelectedSectionId] = useState(DEFAULT_BLUEPRINT_SECTION_ID);

  const selectedSection = useMemo(
    () => getBlueprintSection(selectedSectionId),
    [selectedSectionId],
  );

  const sectionViewModel = useMemo(
    () => buildSectionViewModel(selectedSection),
    [selectedSection],
  );

  return (
    <div className="page-root">
      <header>
        <h1 className="text-xl font-bold text-white tracking-wide">{BLUEPRINT_META.title}</h1>
        <p className="text-sm text-slate-400 mt-1">{BLUEPRINT_META.subtitle}</p>
      </header>

      <BlueprintNavigation
        sections={BLUEPRINT_SECTIONS}
        selectedSectionId={selectedSectionId}
        onSelect={setSelectedSectionId}
      />

      <BlueprintContent sectionViewModel={sectionViewModel} />
    </div>
  );
}
