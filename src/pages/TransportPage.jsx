import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import TransportForm from '@/components/features/transport/TransportForm';
import TransportFilters from '@/components/features/transport/TransportFilters';
import TransportCardGrid from '@/components/features/transport/TransportCardGrid';
import Button from '@/components/ui/Button';
import {
  useTransport,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
} from '@/services/transportService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { buildTransportPayload, computeTransportStats } from '@/config/transportOptions';

function SummaryCard({ label, value, loading }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 shadow-sm">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-400">{loading ? '—' : value}</h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function TransportPage() {
  const { data: drivers = [], loading } = useTransport();
  const { canPerformAction } = useRoleAccess();
  const { staffProfile, firebaseUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const stats = useMemo(() => computeTransportStats(drivers), [drivers]);

  const filteredDrivers = useMemo(() => {
    let filtered = [...drivers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (driver) =>
          driver.name?.toLowerCase().includes(term) ||
          driver.phone?.toLowerCase().includes(term) ||
          driver.vehicle?.toLowerCase().includes(term) ||
          driver.vehicleReg?.toLowerCase().includes(term) ||
          driver.route?.toLowerCase().includes(term),
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((driver) => driver.status === filterStatus);
    }

    filtered.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    });

    return filtered;
  }, [drivers, searchTerm, filterStatus, sortDirection]);

  const getCreatedByName = () =>
    staffProfile?.name || firebaseUser?.displayName || firebaseUser?.email || 'Staff Member';

  const handleAddDriver = () => {
    setEditingDriver(null);
    setIsFormOpen(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const payload = buildTransportPayload(formData, getCreatedByName(), editingDriver);

    if (editingDriver?.id) {
      await updateTransportRoute(editingDriver.id, payload);
    } else {
      await createTransportRoute(payload);
    }

    setIsFormOpen(false);
    setEditingDriver(null);
  };

  const handleDeleteDriver = async (driverId) => {
    try {
      await deleteTransportRoute(driverId);
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver. Please try again.');
    }
  };

  const canManageTransport = canPerformAction('MANAGE_TRANSPORT');

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Saturday Transport</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage external logistics, taxi vendor contact information, and weekly service routes.
          </p>
        </div>
        {canManageTransport && (
          <Button icon={Plus} onClick={handleAddDriver} className="shrink-0 w-full sm:w-auto">
            Add Transport
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard label="Total Drivers" value={stats.totalDrivers} loading={loading} />
        <SummaryCard label="Active Drivers" value={stats.activeDrivers} loading={loading} />
        <SummaryCard label="Total Capacity" value={stats.totalCapacity} loading={loading} />
        <SummaryCard label="Total Routes" value={stats.totalRoutes} loading={loading} />
      </div>

      <TransportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onSortToggle={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        sortDirection={sortDirection}
      />

      <div className="bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="p-4 md:p-5">
            <TransportCardGrid
              drivers={filteredDrivers}
              onEdit={canManageTransport ? handleEditDriver : undefined}
              onDelete={canManageTransport ? handleDeleteDriver : undefined}
              canManage={canManageTransport}
              emptyMessage="No drivers found"
            />
          </div>
        )}
      </div>

      <TransportForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDriver(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDriver}
      />
    </div>
  );
}
