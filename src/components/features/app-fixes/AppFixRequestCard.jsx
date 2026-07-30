import { Paperclip } from 'lucide-react';
import {
  getAppFixCategoryLabel,
  getAppFixDescriptionPreview,
  getAppFixPriorityLabel,
  getAppFixPriorityToneClass,
  getAppFixRequestReferenceNumber,
  getAppFixRequestSubmittedAt,
  getAppFixRequestUpdatedAt,
  getAppFixStatusLabel,
  getAppFixStatusToneClass,
  requestHasAttachments,
} from '@/config/appFixesDisplay';

export default function AppFixRequestCard({ request, onOpen }) {
  const reference = getAppFixRequestReferenceNumber(request);
  const statusLabel = getAppFixStatusLabel(request.status);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(request)}
      aria-label={`${reference}: ${request.title}. Status ${statusLabel}.`}
      className="text-left rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 hover:border-indigo-500/40 hover:bg-slate-900/70 transition min-w-0 w-full"
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-slate-500">{getAppFixRequestReferenceNumber(request)}</p>
          <h3 className="text-sm font-semibold text-white mt-1 truncate">{request.title}</h3>
        </div>
        {requestHasAttachments(request) ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
            <Paperclip className="w-3.5 h-3.5" />
            {request.attachmentCount || 1}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${getAppFixStatusToneClass(request.status)}`}>
          {getAppFixStatusLabel(request.status)}
        </span>
        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${getAppFixPriorityToneClass(request.priority)}`}>
          {getAppFixPriorityLabel(request.priority)}
        </span>
        <span className="inline-flex px-2 py-0.5 rounded-full border border-slate-700 text-[10px] text-slate-300">
          {getAppFixCategoryLabel(request)}
        </span>
      </div>

      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
        {getAppFixDescriptionPreview(request.description)}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
        <span>Submitted: {getAppFixRequestSubmittedAt(request)}</span>
        <span>Updated: {getAppFixRequestUpdatedAt(request)}</span>
      </div>
    </button>
  );
}
