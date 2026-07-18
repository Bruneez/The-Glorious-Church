import { Globe, Edit2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { DestinationImage } from '@/components/features/travelling/TravellingCardGrid';
import { TRAVEL_EXTENT } from '@/config/travellingOptions';
import {
  formatTravelCostZar,
  formatTravelDistance,
  formatTravelExtentLabel,
  formatVisaRequired,
  getDestinationCountryLabel,
  getDestinationPrimaryLabel,
  getDestinationTransportLabel,
} from '@/config/travellingDisplay';

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white mt-1">{value}</p>
    </div>
  );
}

export default function TravellingViewModal({
  destination,
  isOpen,
  onClose,
  onEdit,
  canManage = false,
}) {
  if (!destination) return null;

  const isInternational = destination.travelExtent === TRAVEL_EXTENT.INTERNATIONAL;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Travel Destination Details"
      icon={Globe}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        <DestinationImage destination={destination} className="w-full aspect-[16/9] rounded-xl" />

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {getDestinationPrimaryLabel(destination)}
            </h3>
            <p className="text-sm text-indigo-400/90 font-medium mt-1">
              {formatTravelExtentLabel(destination.travelExtent)}
            </p>
          </div>
          {canManage && onEdit && (
            <Button type="button" variant="secondary" icon={Edit2} onClick={() => onEdit(destination)}>
              Edit Location
            </Button>
          )}
        </div>

        {isInternational ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Country" value={getDestinationCountryLabel(destination)} />
            <DetailField label="Travel Extent" value={formatTravelExtentLabel(destination.travelExtent)} />
            <DetailField
              label="Visa Requirement for South African Citizens"
              value={formatVisaRequired(destination.visaRequired)}
            />
            <DetailField
              label="Estimated Distance from Cape Town"
              value={formatTravelDistance(destination.distanceFromCapeTownKm)}
            />
            <DetailField
              label="Estimated Return Flight Cost"
              value={formatTravelCostZar(destination.estimatedCostZar)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Town / City" value={destination.townCity || 'Not provided'} />
            <DetailField label="Travel Extent" value={formatTravelExtentLabel(destination.travelExtent)} />
            <DetailField
              label="Distance from Cape Town"
              value={formatTravelDistance(destination.distanceFromCapeTownKm)}
            />
            <DetailField
              label="Recommended Transportation"
              value={getDestinationTransportLabel(destination)}
            />
            <DetailField
              label="Estimated Return Travel Cost"
              value={formatTravelCostZar(destination.estimatedCostZar)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
