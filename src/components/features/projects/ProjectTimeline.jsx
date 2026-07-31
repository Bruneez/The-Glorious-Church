import { useMemo, useState } from 'react';
import {
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Pencil,
  X,
} from 'lucide-react';
import {
  buildProjectTimelineItems,
  formatProjectTimelineDate,
  getProjectTimelineMessage,
  getProjectTimelineToneClass,
  getProjectTimelineTypeLabel,
  isProjectImageAttachment,
  PROJECT_TIMELINE_KIND,
} from '@/config/projectsDisplay';
import { PROJECT_UPDATE_TYPE } from '@/config/projectsConstants';
import { canEditProjectUpdate } from '@/services/projectGuards';

function TimelineAttachmentLink({ item }) {
  const isImage = String(item.contentType || '').startsWith('image/');

  return (
    <a
      href={item.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
    >
      {isImage ? (
        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {item.fileName || 'View attachment'}
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}

function TimelineCommentItem({
  item,
  userId,
  onEditComment,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.message || '');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const canEdit = canEditProjectUpdate(
    {
      ...item,
      updateType: PROJECT_UPDATE_TYPE.COMMENT,
    },
    userId,
  );

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setEditError('Message is required.');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      await onEditComment(item.sourceId, trimmed);
      setIsEditing(false);
    } catch (error) {
      setEditError(error?.message || 'Failed to save update.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setEditError('');
          }}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs resize-y"
        />
        {editError ? <p className="text-rose-400 text-[10px]">{editError}</p> : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-70"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(item.message || '');
              setIsEditing(false);
              setEditError('');
            }}
            disabled={isSaving}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-600/50 bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700/80"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
        {getProjectTimelineMessage(item)}
      </p>
      {canEdit ? (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>
      ) : null}
    </div>
  );
}

function TimelineItem({ item, userId, onEditComment }) {
  const toneClass = getProjectTimelineToneClass(item);
  const authorName = item.createdByName || 'System';

  return (
    <li className="relative pl-6 pb-5 last:pb-0">
      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" aria-hidden="true" />
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3.5 space-y-2 min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between min-w-0">
          <div className="min-w-0">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${toneClass}`}>
              {getProjectTimelineTypeLabel(item)}
            </p>
            {item.kind === PROJECT_TIMELINE_KIND.UPDATE ? (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{authorName}</p>
            ) : null}
          </div>
          <p className="text-[10px] text-slate-500 shrink-0">
            {formatProjectTimelineDate(item.updatedAt || item.createdAt)}
          </p>
        </div>

        {item.kind === PROJECT_TIMELINE_KIND.ATTACHMENT ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-300">{getProjectTimelineMessage(item)}</p>
            {isProjectImageAttachment(item) && item.fileUrl ? (
              <img
                src={item.fileUrl}
                alt={item.fileName || 'Attachment preview'}
                className="rounded-md border border-slate-700 max-h-40 w-full object-contain bg-slate-950"
              />
            ) : null}
            {item.fileUrl ? <TimelineAttachmentLink item={item} /> : null}
          </div>
        ) : item.updateType === PROJECT_UPDATE_TYPE.COMMENT ? (
          <TimelineCommentItem item={item} userId={userId} onEditComment={onEditComment} />
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
            {getProjectTimelineMessage(item)}
          </p>
        )}
      </div>
    </li>
  );
}

export default function ProjectTimeline({
  updates = [],
  attachments = [],
  userId = '',
  onEditComment,
}) {
  const items = useMemo(
    () => buildProjectTimelineItems(updates, attachments),
    [updates, attachments],
  );

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/30 px-4 py-8 text-center">
        <p className="text-xs text-slate-500">No project activity yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative border-l border-slate-700/60 ml-1.5 space-y-0">
      {items.map((item) => (
        <TimelineItem
          key={item.id}
          item={item}
          userId={userId}
          onEditComment={onEditComment}
        />
      ))}
    </ol>
  );
}
