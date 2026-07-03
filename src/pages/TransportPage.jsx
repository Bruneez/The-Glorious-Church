import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import TransportForm from '@/components/features/transport/TransportForm';
import TransportFilters from '@/components/features/transport/TransportFilters';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import {
  useTransport,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
} from '@/services/transportService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { buildTransportPayload } from '@/config/transportOptions';
import { getInitials } from '@/utils/formatters';

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

function getDriverVehicle(driver) {
  return driver?.vehicle || driver?.vehicleReg || '';
}

function StatusBadge({ status }) {
  if (!status) {
    return <span className="text-slate-500">-</span>;
  }

  const isActive = status === 'Active';

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

export default function TransportPage() {
  const { data: drivers = [], loading } = useTransport();
  const { canPerformAction } = useRoleAccess();
  const { staffProfile, firebaseUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const filteredDrivers = useMemo(() => {
    let filtered = [...drivers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (driver) =>
          driver.name?.toLowerCase().includes(term) ||
          driver.phone?.toLowerCase().includes(term) ||
          driver.vehicle?.toLowerCase().includes(term) ||
          driver.vehicleReg?.toLowerCase().includes(term),
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

  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      className: 'w-[60px]',
      render: (_, row) => (
        <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400/30 flex items-center justify-center text-xs font-bold uppercase text-white shrink-0">
          {getInitials(row.name) || '?'}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Driver Name',
      render: (value) => (
        <span className="font-medium text-slate-100">{displayValue(value)}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (value) => displayValue(value),
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (_, row) => displayValue(getDriverVehicle(row)),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (value) => (
        <span className="text-slate-300 font-medium">
          {value === null || value === undefined || value === '' ? '-' : value}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Assigned Route',
      render: (value) => displayValue(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (_, row) =>
        canManageTransport && (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleEditDriver(row)}
              className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 transition"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteDriver(row.id)}
              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
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
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="p-4">
            <Table
              columns={columns}
              data={filteredDrivers}
              emptyMessage="No drivers found"
              className="bg-transparent border-0"
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
