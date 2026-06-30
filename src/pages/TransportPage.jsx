import { useState, useMemo } from 'react';
import { PlusCircle, Bus, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import TransportForm from '@/components/features/transport/TransportForm';
import TransportFilters from '@/components/features/transport/TransportFilters';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useTransport, createTransportRoute, updateTransportRoute, deleteTransportRoute } from '@/services/transportService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';
import { getInitials } from '@/utils/formatters';

export default function TransportPage() {
  const { data: drivers = [], loading } = useTransport();
  const { canPerformAction } = useRoleAccess();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const filteredDrivers = useMemo(() => {
    let filtered = [...drivers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(driver =>
        driver.name?.toLowerCase().includes(term) ||
        driver.phone?.toLowerCase().includes(term) ||
        driver.vehicleReg?.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(driver => driver.status === filterStatus);
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

  const handleAddDriver = () => {
    setEditingDriver(null);
    setIsFormOpen(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingDriver) {
        await updateTransportRoute(editingDriver.id, formData);
      } else {
        await createTransportRoute(formData);
      }
      setIsFormOpen(false);
      setEditingDriver(null);
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Failed to save driver. Please try again.');
    }
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
      className: 'w-12',
      render: (value, row) => (
        <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400/30 flex items-center justify-center text-xs font-bold uppercase text-white">
          {getInitials(row.name)}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Driver Details',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-white">{value}</p>
          <p className="text-xs text-slate-400">{row.vehicleType || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact Info',
      render: (value, row) => (
        <div>
          <p className="text-slate-300">{value}</p>
          <p className="text-xs text-slate-500">{row.vehicleReg || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'Vehicle & Capacity',
      render: (value, row) => (
        <div>
          <p className="text-slate-300">{row.vehicleReg || 'N/A'}</p>
          <p className="text-xs text-slate-500">Capacity: {row.capacity || 0}</p>
        </div>
      )
    },
    {
      key: 'route',
      label: 'Assigned Route',
      render: (value) => value || 'Not assigned'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          value === 'Active' 
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
        }`}>
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right w-24',
      render: (value, row) => (
        canManageTransport && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleEditDriver(row)}
              className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 transition"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteDriver(row.id)}
              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Saturday Transport Registry"
        subtitle="Manage external logistics, taxi vendor contact information, and weekly service routes."
        action={
          canManageTransport ? (
            <Button icon={PlusCircle} onClick={handleAddDriver}>
              Add Taxi Driver
            </Button>
          ) : null
        }
      />

      <TransportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onSortToggle={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        sortDirection={sortDirection}
      />

      <div className="bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredDrivers}
            emptyMessage="No drivers found"
            className="bg-transparent"
          />
        )}
      </div>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_TRANSPORT">
          <button
            onClick={handleAddDriver}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </RoleGate>
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
