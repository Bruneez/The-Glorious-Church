import { Eye, Edit2, Trash2, Globe, MapPin, ImageOff } from 'lucide-react';
import { TRAVEL_EXTENT } from '@/config/travellingOptions';
import {
  formatTravelCostZar,
  formatTravelDistance,
  formatVisaRequired,
  getDestinationImageUrl,
  getDestinationImageAlt,
  getDestinationPrimaryLabel,
  getDestinationTransportLabel,
} from '@/config/travellingDisplay';

function DestinationImage({ destination, className = '' }) {
  const imageUrl = getDestinationImageUrl(destination);
  const imageAlt = getDestinationImageAlt(destination);

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 border border-slate-700/70 ${className}`}
        role="img"
        aria-label={imageAlt}
      >
        <div className="text-center px-3">
          <ImageOff className="w-7 h-7 text-slate-600 mx-auto mb-1.5" aria-hidden="true" />
          <p className="text-[10px] text-slate-500 font-medium">No image provided</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={imageAlt}
      className={`object-cover bg-slate-800 ${className}`}
    />
  );
}

function DestinationCard({
  destination,
  onView,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const isInternational = destination.travelExtent === TRAVEL_EXTENT.INTERNATIONAL;

  return (
    <article className="bg-slate-900/60 border border-slate-700/70 rounded-xl overflow-hidden flex flex-col hover:border-indigo-500/40 hover:bg-slate-900/80 transition shadow-sm">
      <button
        type="button"
        onClick={() => onView?.(destination)}
        className="text-left flex flex-col flex-1"
      >
        <DestinationImage
          destination={destination}
          className="w-full aspect-[16/10]"
        />

        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {getDestinationPrimaryLabel(destination)}
            </h3>
            <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5">
              {isInternational ? 'International destination' : 'National destination'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-300">
            {isInternational ? (
              <>
                <p>
                  <span className="text-slate-500">Visa Required:</span>{' '}
                  {formatVisaRequired(destination.visaRequired)}
                </p>
                <p>
                  <span className="text-slate-500">Distance:</span>{' '}
                  {formatTravelDistance(destination.distanceFromCapeTownKm)}
                </p>
                <p>
                  <span className="text-slate-500">Estimated Flight Cost:</span>{' '}
                  {formatTravelCostZar(destination.estimatedCostZar)}
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="text-slate-500">Distance:</span>{' '}
                  {formatTravelDistance(destination.distanceFromCapeTownKm)}
                </p>
                <p>
                  <span className="text-slate-500">Recommended Travel:</span>{' '}
                  {getDestinationTransportLabel(destination)}
                </p>
                <p>
                  <span className="text-slate-500">Estimated Cost:</span>{' '}
                  {formatTravelCostZar(destination.estimatedCostZar)}
                </p>
              </>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2 border-t border-slate-700/60">
        <button
          type="button"
          onClick={() => onView?.(destination)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white px-3 py-2 min-h-[44px] rounded-lg hover:bg-slate-800 transition"
          aria-label={`View details for ${getDestinationPrimaryLabel(destination)}`}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        {canManage && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(destination)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-2 min-h-[44px] rounded-lg hover:bg-indigo-500/10 transition"
            aria-label={`Edit ${getDestinationPrimaryLabel(destination)}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(destination)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-3 py-2 min-h-[44px] rounded-lg hover:bg-rose-500/10 transition"
            aria-label={`Delete ${getDestinationPrimaryLabel(destination)}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default function TravellingCardGrid({
  destinations = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No travel locations found yet.',
  isInternational = true,
}) {
  if (!destinations.length) {
    const Icon = isInternational ? Globe : MapPin;

    return (
      <div className="py-12 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
        <Icon className="w-8 h-8 text-slate-600 mx-auto mb-2" aria-hidden="true" />
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {destinations.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
}

export { DestinationImage };
