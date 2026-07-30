import { useMemo } from 'react';
import { Bug, ExternalLink, Pencil } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import AppFixDetailLoadingSkeleton from '@/components/features/app-fixes/AppFixDetailLoadingSkeleton';
import { getAppFixErrorMessage } from '@/config/appFixesErrorMessages';
import {
  canUserEditRequestByStatus,
  getAppFixAffectedModuleDisplay,
  getAppFixBrowserModeLabel,
  getAppFixCategoryLabel,
  getAppFixDeviceTypeLabel,
  getAppFixPriorityLabel,
  getAppFixRequestReferenceNumber,
  getAppFixRequestSubmittedAt,
  getAppFixRequestUpdatedAt,
  getAppFixStatusLabel,
  getAppFixStatusToneClass,
  getAppFixUpdateTimelineLabel,
  formatAppFixUpdateTimestamp,
  isImageAttachment,
  isPdfAttachment,
  isVideoAttachment,
} from '@/config/appFixesDisplay';
import { useAppFixRequestDetails } from '@/services/appFixesService';

function DetailField({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xs text-slate-200 mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function AttachmentList({ attachments = [] }) {
  if (!attachments.length) {
    return <p className="text-xs text-slate-500">No attachments uploaded.</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="rounded-lg border border-slate-700/70 bg-slate-900/50 p-3"
        >
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-xs text-white truncate">{attachment.fileName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{attachment.contentType}</p>
            </div>
            {attachment.fileUrl ? (
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 shrink-0"
              >
                Open
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>

          {isImageAttachment(attachment) && attachment.fileUrl ? (
            <img
              src={attachment.fileUrl}
              alt={attachment.fileName}
              className="mt-3 rounded-md border border-slate-700 max-h-48 w-full object-contain bg-slate-950"
            />
          ) : null}

          {isVideoAttachment(attachment) && attachment.fileUrl ? (
            <video
              controls
              src={attachment.fileUrl}
              className="mt-3 rounded-md border border-slate-700 max-h-48 w-full bg-slate-950"
            />
          ) : null}

          {isPdfAttachment(attachment) ? (
            <p className="text-[11px] text-slate-400 mt-2">PDF attachment available via Open link.</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function AppFixRequestViewModal({
  request,
  isOpen,
  onClose,
  onEdit,
  canEdit = false,
}) {
  const requestId = request?.id || '';
  const { updates, attachments, loading, error } = useAppFixRequestDetails(requestId, {
    enabled: isOpen && Boolean(requestId),
  });

  const timelineItems = useMemo(() => {
    return [...updates].sort((left, right) => {
      const leftTime = left.createdAt?.toDate?.()?.getTime?.() || Date.parse(left.createdAt || 0) || 0;
      const rightTime = right.createdAt?.toDate?.()?.getTime?.() || Date.parse(right.createdAt || 0) || 0;
      return rightTime - leftTime;
    });
  }, [updates]);

  const editable = canEdit && canUserEditRequestByStatus(request);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={request?.title || 'Request Details'}
      icon={Bug}
      maxWidth="max-w-3xl"
      panelClassName="p-4 space-y-4"
    >
      {error ? (
        <div role="alert" className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-300">
          {getAppFixErrorMessage(error, 'Failed to load request details. Please try again.')}
        </div>
      ) : null}

      {request ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">{getAppFixRequestReferenceNumber(request)}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${getAppFixStatusToneClass(request.status)}`}>
                  {getAppFixStatusLabel(request.status)}
                </span>
                <span className="inline-flex px-2 py-0.5 rounded-full border border-slate-700 text-[10px] text-slate-300">
                  {getAppFixPriorityLabel(request.priority)}
                </span>
              </div>
            </div>

            {editable ? (
              <Button icon={Pencil} variant="secondary" onClick={() => onEdit?.(request)} className="shrink-0">
                Edit Request
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
            <span>Submitted: {getAppFixRequestSubmittedAt(request)}</span>
            <span>Last updated: {getAppFixRequestUpdatedAt(request)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="Category" value={getAppFixCategoryLabel(request)} />
            <DetailField label="Affected Module" value={getAppFixAffectedModuleDisplay(request)} />
            <DetailField label="Device Type" value={getAppFixDeviceTypeLabel(request.deviceType)} />
            <DetailField label="Browser/App Mode" value={getAppFixBrowserModeLabel(request.browserMode)} />
          </div>

          <DetailField label="Description" value={request.description} />
          <DetailField label="Steps to Reproduce" value={request.stepsToReproduce} />
          <DetailField label="Error Message" value={request.errorMessage} />

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Timeline & Responses</h4>
            {loading ? (
              <AppFixDetailLoadingSkeleton />
            ) : timelineItems.length ? (
              <ol className="space-y-3">
                {timelineItems.map((update) => (
                  <li
                    key={update.id}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-white">
                        {getAppFixUpdateTimelineLabel(update)}
                      </p>
                      <p className="text-[11px] text-slate-500 shrink-0">
                        {formatAppFixUpdateTimestamp(update)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">{update.message}</p>
                    {update.createdByName ? (
                      <p className="text-[11px] text-slate-500 mt-2">{update.createdByName}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-500">No responses yet.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Attachments</h4>
            {loading ? (
              <AppFixDetailLoadingSkeleton />
            ) : (
              <AttachmentList attachments={attachments} />
            )}
          </div>
        </>
      ) : null}
    </Modal>
  );
}
