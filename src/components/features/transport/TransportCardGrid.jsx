import { Bus, Edit2, Trash2, MapPin, Phone, Users } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { getDriverVehicle, getVehicleImage, TRANSPORT_STATUS } from '@/config/transportOptions';

function StatusBadge({ status }) {
  if (!status) {
    return <span className="text-slate-500">—</span>;
  }

  const isActive = status === TRANSPORT_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isActive
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {status}
    </span>
  );
}

function VehicleAvatar({ driver }) {
  const image = getVehicleImage(driver);

  if (image) {
    return <UserAvatar name={driver.name} photo={image} size="lg" />;
  }

  return (
    <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0">
      <Bus className="w-5 h-5 text-indigo-400" />
    </div>
  );
}

function DriverCard({ driver, onEdit, onDelete, canManage = false }) {
  const vehicle = getDriverVehicle(driver);
  const capacity = driver.capacity ?? '—';

  return (
    <article className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 flex flex-col gap-4 hover:border-indigo-500/40 hover:bg-slate-900/80 transition shadow-sm">
      <div className="flex items-start gap-3">
        <VehicleAvatar driver={driver} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide truncate">{driver.name}</h3>
            <StatusBadge status={driver.status} />
          </div>
          <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5 truncate">{vehicle || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Seating</p>
          <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {capacity}
            {capacity !== '—' && (
              <span className="text-[10px] font-normal text-slate-500">seats</span>
            )}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Route</p>
          <p className="text-xs font-medium text-slate-200 mt-1 flex items-start gap-1.5 truncate" title={driver.route}>
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="truncate">{driver.route || '—'}</span>
          </p>
        </div>
      </div>

      {driver.phone && (
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{driver.phone}</span>
        </p>
      )}

      {canManage && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(driver)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(driver.id)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function TransportCardGrid({
  drivers = [],
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No drivers found.',
}) {
  if (!drivers.length) {
    return (
      <div className="py-12 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
        <Bus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
}
