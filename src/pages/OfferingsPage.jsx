import { useState, useMemo } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import OfferingForm from '@/components/features/offerings/OfferingForm';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useOfferings, createOffering, deleteOffering } from '@/services/offeringsService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';
import { formatDate, formatCurrencySimple } from '@/utils/formatters';

export default function OfferingsPage() {
  const { data: offerings = [], loading } = useOfferings();
  const { canPerformAction } = useRoleAccess();
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const stats = useMemo(() => {
    if (offerings.length === 0) {
      return { total: 0, average: 0 };
    }

    const amounts = offerings.map(o => o.amount || 0);
    const total = amounts.reduce((a, b) => a + b, 0);
    const average = total / amounts.length;

    return { total, average };
  }, [offerings]);

  const handleAddOffering = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await createOffering(formData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving offering:', error);
      alert('Failed to save offering. Please try again.');
    }
  };

  const handleDeleteOffering = async (offeringId) => {
    try {
      await deleteOffering(offeringId);
    } catch (error) {
      console.error('Error deleting offering:', error);
      alert('Failed to delete offering. Please try again.');
    }
  };

  const canManageOfferings = canPerformAction('MANAGE_OFFERINGS');

  const columns = [
    {
      key: 'date',
      label: 'Collection Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'amount',
      label: 'Amount Gathered',
      render: (value) => formatCurrencySimple(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, row) => (
        canManageOfferings && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleDeleteOffering(row.id)}
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
        title="Financial Offerings Tracker"
        action={
          canManageOfferings ? (
            <Button icon={PlusCircle} variant="success" onClick={handleAddOffering}>
              Log Service Collection
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
        <Card className="bg-[#131b2e] border-slate-900">
          <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Total Collections Stored</p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">{formatCurrencySimple(stats.total)}</h3>
        </Card>
        <Card className="bg-[#131b2e] border-slate-900">
          <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Average Offering Collection</p>
          <h3 className="text-xl font-bold text-indigo-400 mt-1">{formatCurrencySimple(stats.average)}</h3>
        </Card>
      </div>

      <Card className="bg-[#131b2e] border-slate-900">
        <div className="p-4 border-b border-slate-900 bg-slate-800/20 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Offerings Registry Record Book</span>
          <span className="text-[10px] text-slate-400 font-medium">{offerings.length} logs saved</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={offerings}
            emptyMessage="No offerings recorded"
            className="bg-transparent"
          />
        )}
      </Card>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_OFFERINGS">
          <button
            onClick={handleAddOffering}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-full shadow-lg"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </RoleGate>
      </div>

      <OfferingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
