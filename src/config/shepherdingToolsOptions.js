export const SHEPHERDING_TOOLS_TAB_IDS = {
  AUDIO_SERMONS: 'audio-sermons',
  VIDEO_SERMONS: 'video-sermons',
  MUSIC: 'music',
  BOOKS: 'books',
  DAILY_DEVOTIONALS: 'daily-devotionals',
};

export const SHEPHERDING_TOOLS_TABS = [
  {
    id: SHEPHERDING_TOOLS_TAB_IDS.AUDIO_SERMONS,
    label: 'Audio Sermons',
    emptyMessage: 'No audio sermons have been added yet.',
    searchPlaceholder: 'Search audio sermons...',
    addLabel: 'Add Audio Sermon',
  },
  {
    id: SHEPHERDING_TOOLS_TAB_IDS.VIDEO_SERMONS,
    label: 'Video Sermons',
    emptyMessage: 'No video sermons have been added yet.',
    searchPlaceholder: 'Search video sermons...',
    addLabel: 'Add Video Sermon',
  },
  {
    id: SHEPHERDING_TOOLS_TAB_IDS.MUSIC,
    label: 'Music',
    emptyMessage: 'No music resources have been added yet.',
    searchPlaceholder: 'Search music...',
    addLabel: 'Add Music',
  },
  {
    id: SHEPHERDING_TOOLS_TAB_IDS.BOOKS,
    label: 'Books',
    emptyMessage: 'No books have been added yet.',
    searchPlaceholder: 'Search books...',
    addLabel: 'Add Book',
  },
  {
    id: SHEPHERDING_TOOLS_TAB_IDS.DAILY_DEVOTIONALS,
    label: 'Daily Devotionals',
    emptyMessage: 'No devotionals have been published yet.',
    searchPlaceholder: 'Search devotionals...',
    addLabel: 'Add Devotional',
  },
];

export const DEFAULT_SHEPHERDING_TOOLS_TAB = SHEPHERDING_TOOLS_TAB_IDS.AUDIO_SERMONS;

export function getShepherdingToolsTabById(tabId) {
  return SHEPHERDING_TOOLS_TABS.find((tab) => tab.id === tabId) || SHEPHERDING_TOOLS_TABS[0];
}
