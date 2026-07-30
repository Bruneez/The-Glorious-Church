import { BookOpen, Mic, Music, ScrollText, Video } from 'lucide-react';
import { SHEPHERDING_TOOLS_TABS } from '@/config/shepherdingToolsOptions';

const TAB_ICONS = {
  'audio-sermons': Mic,
  'video-sermons': Video,
  music: Music,
  books: BookOpen,
  'daily-devotionals': ScrollText,
};

export default function ShepherdingToolsTabs({ activeTab, onTabChange }) {
  return (
    <div
      role="tablist"
      aria-label="Shepherding Tools sections"
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 max-w-full"
    >
      {SHEPHERDING_TOOLS_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = TAB_ICONS[tab.id];

        return (
          <button
            key={tab.id}
            id={`shepherding-tools-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`shepherding-tools-panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
              isActive
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {Icon ? <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : null}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
