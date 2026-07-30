import { ExternalLink, BookOpen, Edit2, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ResourceCover } from '@/components/features/shepherding-tools/ResourceCard';
import {
  getResourceActionLabel,
  getResourceCardModel,
  getResourceCoverAspectClass,
  getResourceCoverInitials,
  getResourceCoverUrl,
  getResourceTitle,
  shouldShowResourceCover,
} from '@/config/shepherdingToolsDisplay';
import { SHEPHERDING_RESOURCE_TYPES, PUBLISHED_STATUS } from '@/config/shepherdingToolsConstants';

function DetailField({ label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white mt-1 break-words">{value}</p>
    </div>
  );
}

export default function ShepherdingToolsViewModal({
  resource,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  canManage = false,
  isPublishing = false,
}) {
  if (!resource) return null;

  const card = getResourceCardModel(resource, { showDraftStatus: canManage });
  const isDevotional = resource.resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL;
  const showCover = shouldShowResourceCover(resource);
  const coverUrl = getResourceCoverUrl(resource);

  const handleExternalAction = () => {
    if (!card.externalUrl) return;
    window.open(card.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resource Details"
      icon={BookOpen}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        <div className={`grid grid-cols-1 ${showCover ? 'md:grid-cols-[220px_minmax(0,1fr)]' : ''} gap-5`}>
          {showCover ? (
            <ResourceCover
              coverUrl={coverUrl}
              coverAlt={card.coverAlt}
              coverAspectClass={getResourceCoverAspectClass(resource)}
              initials={getResourceCoverInitials(resource)}
              className="w-full max-w-[220px] mx-auto md:mx-0 rounded-xl"
            />
          ) : null}

          <div className="space-y-4 min-w-0">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wide">{getResourceTitle(resource)}</h3>
              {card.subtitle ? (
                <p className="text-sm text-indigo-400/90 font-medium mt-1">{card.subtitle}</p>
              ) : null}
              {canManage && card.isDraft ? (
                <span className="inline-flex mt-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Draft
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {card.metadata.map((item) => (
                <DetailField key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
        </div>

        {card.contentPreview && !isDevotional ? (
          <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Short Description</p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{card.contentPreview}</p>
          </div>
        ) : null}

        {resource.fullDescription && !isDevotional ? (
          <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Description</p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{resource.fullDescription}</p>
          </div>
        ) : null}

        {isDevotional && resource.devotionalContent ? (
          <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Devotional</p>
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {resource.devotionalContent}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-2 border-t border-slate-700">
          {(card.isExternalAction || isDevotional) ? (
            <Button
              icon={card.isExternalAction ? ExternalLink : undefined}
              onClick={handleExternalAction}
              disabled={!card.isExternalAction}
              className="w-full sm:w-auto"
            >
              {getResourceActionLabel(resource)}
            </Button>
          ) : null}

          {canManage && onEdit ? (
            <Button variant="secondary" icon={Edit2} onClick={() => onEdit(resource)} className="w-full sm:w-auto">
              Edit
            </Button>
          ) : null}

          {canManage && resource.publishedStatus === PUBLISHED_STATUS.DRAFT && onPublish ? (
            <Button
              variant="success"
              onClick={() => onPublish(resource)}
              isLoading={isPublishing}
              className="w-full sm:w-auto"
            >
              Publish
            </Button>
          ) : null}

          {canManage && resource.publishedStatus === PUBLISHED_STATUS.PUBLISHED && onUnpublish ? (
            <Button
              variant="outline"
              onClick={() => onUnpublish(resource)}
              isLoading={isPublishing}
              className="w-full sm:w-auto"
            >
              Unpublish
            </Button>
          ) : null}

          {canManage && onDelete ? (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(resource)} className="w-full sm:w-auto">
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
