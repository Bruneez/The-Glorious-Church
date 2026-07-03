import { Coins } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatDate, formatCurrencySimple } from '@/utils/formatters';
import { getOfferingTotalAmount } from '@/config/offeringsOptions';

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white mt-1">{value}</p>
    </div>
  );
}

export default function OfferingViewModal({ offering, isOpen, onClose }) {
  if (!offering) return null;

  const serviceDate = offering.serviceDate || offering.date || '';
  const totalAmount = getOfferingTotalAmount(offering);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Offering Details" icon={Coins} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailField
            label="Date of Service"
            value={serviceDate ? formatDate(serviceDate) : '-'}
          />
          <DetailField label="Total Amount" value={formatCurrencySimple(totalAmount)} />
          <DetailField label="Recorded By" value={offering.recordedBy || '-'} />
          <DetailField
            label="Created At"
            value={offering.createdAt ? formatDate(offering.createdAt, 'short') : '-'}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
