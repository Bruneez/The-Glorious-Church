import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  SERVICE_TYPE_OPTIONS,
  formatServiceDateDisplay,
} from '@/config/serviceProgramOptions';

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="block text-slate-400 mb-1 font-medium text-xs">{label}</p>
      <p className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-2.5 text-sm text-white">
        {value || '—'}
      </p>
    </div>
  );
}

export default function ServiceProgramControls({
  serviceDate,
  serviceType,
  onServiceDateChange,
  onServiceTypeChange,
  readOnly = false,
}) {
  if (readOnly) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadOnlyField label="Service Date" value={formatServiceDateDisplay(serviceDate)} />
        <ReadOnlyField label="Service Type" value={serviceType} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        label="Service Date"
        type="date"
        name="serviceDate"
        value={serviceDate}
        onChange={onServiceDateChange}
      />
      <Select
        label="Service Type"
        name="serviceType"
        value={serviceType}
        onChange={onServiceTypeChange}
        options={SERVICE_TYPE_OPTIONS}
        placeholder="Select service type"
      />
    </div>
  );
}
