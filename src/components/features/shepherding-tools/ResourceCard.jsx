import { useState } from 'react';
import { ExternalLink, ImageOff } from 'lucide-react';
import {
  getResourceCardModel,
  getResourceCoverInitials,
} from '@/config/shepherdingToolsDisplay';

const BADGE_STYLES = {
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
};

function ResourceCover({
  coverUrl,
  coverAlt,
  coverAspectClass,
  initials,
  className = '',
}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!coverUrl || hasImageError) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 border border-slate-700/70 ${coverAspectClass} ${className}`}
        role="img"
        aria-label={coverAlt}
      >
        <div className="text-center px-3">
          {initials ? (
            <div
              className="w-12 h-12 mx-auto mb-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300"
              aria-hidden="true"
            >
              {initials}
            </div>
          ) : (
            <ImageOff className="w-7 h-7 text-slate-600 mx-auto mb-1.5" aria-hidden="true" />
          )}
          <p className="text-[10px] text-slate-500 font-medium">No cover image</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={coverAlt}
      loading="lazy"
      onError={() => setHasImageError(true)}
      className={`object-cover bg-slate-800 ${coverAspectClass} ${className}`}
    />
  );
}

function ResourceBadges({ badges = [], floating = true }) {
  if (!badges.length) return null;

  return (
    <div
      className={
        floating
          ? 'absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[calc(100%-1rem)]'
          : 'flex flex-wrap gap-1.5'
      }
    >
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border ${
            BADGE_STYLES[badge.tone] || BADGE_STYLES.indigo
          }`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export default function ResourceCard({
  resource,
  showDraftStatus = false,
  onView,
  onOpenExternal,
}) {
  const card = getResourceCardModel(resource, { showDraftStatus });

  const handleAction = (event) => {
    event.stopPropagation();
    if (!card.isExternalAction || !card.externalUrl) return;

    if (typeof onOpenExternal === 'function') {
      onOpenExternal(card.externalUrl, resource);
      return;
    }

    window.open(card.externalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    onView?.(resource);
  };

  const coverInitials = getResourceCoverInitials(resource);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className="bg-slate-900/60 border border-slate-700/70 rounded-xl overflow-hidden flex flex-col hover:border-indigo-500/40 hover:bg-slate-900/80 hover:-translate-y-0.5 transition duration-200 shadow-sm min-w-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
    >
      {card.showCover ? (
        <div className="relative">
          <ResourceCover
            coverUrl={card.coverUrl}
            coverAlt={card.coverAlt}
            coverAspectClass={card.coverAspectClass}
            initials={coverInitials}
            className="w-full"
          />
          <ResourceBadges badges={card.badges} />
        </div>
      ) : card.badges.length ? (
        <div className="px-4 pt-4">
          <ResourceBadges badges={card.badges} floating={false} />
        </div>
      ) : null}

      <div className="p-4 flex flex-col gap-3 flex-1 min-w-0">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white tracking-wide line-clamp-2">
            {card.title}
          </h3>
          {card.showSubtitle && card.subtitle ? (
            <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5 line-clamp-1">
              {card.subtitle}
            </p>
          ) : null}
        </div>

        {card.contentPreview ? (
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
            {card.contentPreview}
          </p>
        ) : null}

        {card.metadata.length ? (
          <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-300">
            {card.metadata.map((item) => (
              <p key={`${card.id}-${item.label}`} className="min-w-0">
                <span className="text-slate-500">{item.label}:</span>{' '}
                <span className="break-words">{item.value}</span>
              </p>
            ))}
          </div>
        ) : null}

        {card.showActionButton ? (
          <div className="mt-auto pt-1">
            <button
              type="button"
              onClick={handleAction}
              disabled={!card.isExternalAction}
              className={`inline-flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold px-3 py-2.5 min-h-[44px] rounded-lg transition ${
                card.isExternalAction
                  ? 'text-white bg-indigo-600 hover:bg-indigo-500'
                  : 'text-slate-300 bg-slate-800 border border-slate-700 cursor-default'
              }`}
            >
              {card.isExternalAction ? (
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : null}
              {card.actionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export { ResourceCover };
