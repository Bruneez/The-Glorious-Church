import {
  Compass,
  Target,
  Scale,
  Crown,
  Heart,
  Sparkles,
  TrendingUp,
  Building2,
  Palette,
  Users,
  Footprints,
  FileText,
} from 'lucide-react';

/**
 * Supported Blueprint content block types.
 * Renderers for these types can be added incrementally without changing page layout.
 */
export const BLUEPRINT_CONTENT_TYPES = {
  RICH_TEXT: 'richtext',
  IMAGE: 'image',
  DIAGRAM: 'diagram',
  PDF: 'pdf',
  INTERNAL_LINK: 'internalLink',
  COLLAPSIBLE: 'collapsible',
  TABLE: 'table',
  ORG_CHART: 'orgChart',
  MINISTRY_DIAGRAM: 'ministryDiagram',
  DOCUMENT: 'document',
};

export const BLUEPRINT_CONTENT_TYPE_META = {
  [BLUEPRINT_CONTENT_TYPES.RICH_TEXT]: {
    label: 'Rich text content',
    description: 'Formatted articles, statements, and long-form church documentation.',
  },
  [BLUEPRINT_CONTENT_TYPES.IMAGE]: {
    label: 'Images',
    description: 'Photos, banners, and visual references for this section.',
  },
  [BLUEPRINT_CONTENT_TYPES.DIAGRAM]: {
    label: 'Embedded diagrams',
    description: 'Flow charts, process maps, and visual explainers.',
  },
  [BLUEPRINT_CONTENT_TYPES.PDF]: {
    label: 'PDF attachments',
    description: 'Downloadable PDF files and printable resources.',
  },
  [BLUEPRINT_CONTENT_TYPES.INTERNAL_LINK]: {
    label: 'Internal links',
    description: 'Cross-links to related Blueprint sections.',
  },
  [BLUEPRINT_CONTENT_TYPES.COLLAPSIBLE]: {
    label: 'Expandable sections',
    description: 'Collapsible sub-sections for detailed reference material.',
  },
  [BLUEPRINT_CONTENT_TYPES.TABLE]: {
    label: 'Tables',
    description: 'Structured data, lists, and comparison tables.',
  },
  [BLUEPRINT_CONTENT_TYPES.ORG_CHART]: {
    label: 'Leadership organisational charts',
    description: 'Hierarchy and reporting structure visualisations.',
  },
  [BLUEPRINT_CONTENT_TYPES.MINISTRY_DIAGRAM]: {
    label: 'Ministry diagrams',
    description: 'Ministry structure and team relationship diagrams.',
  },
  [BLUEPRINT_CONTENT_TYPES.DOCUMENT]: {
    label: 'Church documents',
    description: 'Policies, guides, forms, and official church documents.',
  },
};

export const BLUEPRINT_META = {
  title: 'Blueprint',
  subtitle: 'The foundational reference library for The Glorious Church.',
};

/**
 * Blueprint knowledge-base sections.
 * Add or update entries here — page and component logic stay unchanged.
 */
export const BLUEPRINT_SECTIONS = [
  {
    id: 'vision',
    title: 'Vision',
    subtitle: 'Where we are going as a church.',
    icon: Compass,
    placeholderContent:
      'Content coming soon...\n\nThe Vision content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.IMAGE,
      BLUEPRINT_CONTENT_TYPES.DOCUMENT,
    ],
  },
  {
    id: 'mission',
    title: 'Mission',
    subtitle: 'How we fulfil our calling together.',
    icon: Target,
    placeholderContent:
      'Content coming soon...\n\nThe Mission content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.INTERNAL_LINK,
      BLUEPRINT_CONTENT_TYPES.DOCUMENT,
    ],
  },
  {
    id: 'governance',
    title: 'Governance',
    subtitle: 'How The Glorious Church is structured and accountable.',
    icon: Scale,
    placeholderContent:
      'Content coming soon...\n\nThe Governance content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.DIAGRAM,
      BLUEPRINT_CONTENT_TYPES.PDF,
      BLUEPRINT_CONTENT_TYPES.DOCUMENT,
    ],
  },
  {
    id: 'leadership-structure',
    title: 'Leadership Structure',
    subtitle: 'How leadership is organised across the church.',
    icon: Crown,
    placeholderContent: 'Content coming soon...',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.ORG_CHART,
      BLUEPRINT_CONTENT_TYPES.IMAGE,
      BLUEPRINT_CONTENT_TYPES.COLLAPSIBLE,
      BLUEPRINT_CONTENT_TYPES.PDF,
    ],
  },
  {
    id: 'church-values',
    title: 'Church Values',
    subtitle: 'The principles that guide our decisions and behaviour.',
    icon: Heart,
    placeholderContent:
      'Content coming soon...\n\nThe Church Values content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.IMAGE,
      BLUEPRINT_CONTENT_TYPES.COLLAPSIBLE,
    ],
  },
  {
    id: 'church-culture',
    title: 'Church Culture',
    subtitle: 'How we live, worship, and serve together.',
    icon: Sparkles,
    placeholderContent:
      'Content coming soon...\n\nThe Church Culture content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.IMAGE,
      BLUEPRINT_CONTENT_TYPES.COLLAPSIBLE,
    ],
  },
  {
    id: 'strategic-objectives',
    title: 'Strategic Objectives',
    subtitle: 'What we aim to achieve over time.',
    icon: TrendingUp,
    placeholderContent:
      'Content coming soon...\n\nThe Strategic Objectives content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.TABLE,
      BLUEPRINT_CONTENT_TYPES.PDF,
    ],
  },
  {
    id: 'ministry-departments',
    title: 'Ministry Departments',
    subtitle: 'How serving ministries are organised.',
    icon: Building2,
    placeholderContent:
      'Content coming soon...\n\nThe Ministry Departments content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.MINISTRY_DIAGRAM,
      BLUEPRINT_CONTENT_TYPES.TABLE,
      BLUEPRINT_CONTENT_TYPES.INTERNAL_LINK,
    ],
  },
  {
    id: 'creative-arts-structure',
    title: 'Creative Arts Structure',
    subtitle: 'How creative arts teams and departments are arranged.',
    icon: Palette,
    placeholderContent:
      'Content coming soon...\n\nThe Creative Arts Structure content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.MINISTRY_DIAGRAM,
      BLUEPRINT_CONTENT_TYPES.DIAGRAM,
      BLUEPRINT_CONTENT_TYPES.DOCUMENT,
    ],
  },
  {
    id: 'shepherding-structure',
    title: 'Shepherding Structure',
    subtitle: 'How pastoral care and shepherding are organised.',
    icon: Users,
    placeholderContent:
      'Content coming soon...\n\nThe Shepherding Structure content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.ORG_CHART,
      BLUEPRINT_CONTENT_TYPES.DIAGRAM,
      BLUEPRINT_CONTENT_TYPES.COLLAPSIBLE,
    ],
  },
  {
    id: 'membership-journey',
    title: 'Membership Journey',
    subtitle: 'The path from visitor to committed member.',
    icon: Footprints,
    placeholderContent:
      'Content coming soon...\n\nThe Membership Journey content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.DIAGRAM,
      BLUEPRINT_CONTENT_TYPES.COLLAPSIBLE,
      BLUEPRINT_CONTENT_TYPES.INTERNAL_LINK,
    ],
  },
  {
    id: 'church-policies',
    title: 'Church Policies',
    subtitle: 'Official policies and guidelines for church life.',
    icon: FileText,
    placeholderContent:
      'Content coming soon...\n\nThe Church Policies content will be added in a future update.',
    plannedContentTypes: [
      BLUEPRINT_CONTENT_TYPES.RICH_TEXT,
      BLUEPRINT_CONTENT_TYPES.DOCUMENT,
      BLUEPRINT_CONTENT_TYPES.PDF,
      BLUEPRINT_CONTENT_TYPES.TABLE,
    ],
  },
];

export const DEFAULT_BLUEPRINT_SECTION_ID = BLUEPRINT_SECTIONS[0]?.id || '';

export function getBlueprintSection(sectionId) {
  return BLUEPRINT_SECTIONS.find((section) => section.id === sectionId) || null;
}

export function parseBlueprintPlaceholderContent(content = '') {
  return String(content)
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function getBlueprintPlannedContentMeta(section) {
  if (!section?.plannedContentTypes?.length) return [];

  return section.plannedContentTypes
    .map((type) => ({
      type,
      ...BLUEPRINT_CONTENT_TYPE_META[type],
    }))
    .filter((entry) => entry.label);
}

/**
 * Future hook point: map content block type → renderer component.
 * Block renderers can be registered here as they are implemented.
 */
export const BLUEPRINT_CONTENT_RENDERERS = {
  // [BLUEPRINT_CONTENT_TYPES.RICH_TEXT]: BlueprintRichTextBlock,
};

export function resolveBlueprintContentBlocks(section) {
  const blocks = section?.contentBlocks;

  if (Array.isArray(blocks) && blocks.length > 0) {
    return blocks;
  }

  return [];
}
