import { useState, useMemo } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import AttendanceForm from '@/components/features/attendance/AttendanceForm';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useAttendance, createAttendanceRecord, deleteAttendanceRecord } from '@/services/attendanceService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';
import { formatDate } from '@/utils/formatters';

export default function AttendancePage() {
  const { data: records = [], loading } = useAttendance();
  const { canPerformAction } = useRoleAccess();
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const stats = useMemo(() => {
    if (records.length === 0) {
      return { peak: 0, average: 0 };
    }

    const counts = records.map(r => r.count || 0);
    const peak = Math.max(...counts);
    const average = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);

    return { peak, average };
  }, [records]);

  const handleAddRecord = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await createAttendanceRecord(formData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving attendance record:', error);
      alert('Failed to save attendance record. Please try again.');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteAttendanceRecord(recordId);
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('Failed to delete attendance record. Please try again.');
    }
  };

  const canManageAttendance = canPerformAction('MANAGE_ATTENDANCE');

  const columns = [
    {
      key: 'date',
      label: 'Scheduled Service Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'count',
      label: 'Total Attendance Headcount'
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, row) => (
        canManageAttendance && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleDeleteRecord(row.id)}
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
        title="Service Attendance Analytics"
        action={
          canManageAttendance ? (
            <Button icon={PlusCircle} onClick={handleAddRecord}>
              Record Headcount
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
        <Card className="bg-[#131b2e] border-slate-900">
          <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Highest Attended Service</p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">{stats.peak}</h3>
        </Card>
        <Card className="bg-[#131b2e] border-slate-900">
          <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Average Running Metric</p>
          <h3 className="text-xl font-bold text-indigo-400 mt-1">{stats.average}</h3>
        </Card>
      </div>

      <Card className="bg-[#131b2e] border-slate-900">
        <div className="p-4 border-b border-slate-900 bg-slate-800/20 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Attendance Logs Ledger</span>
          <span className="text-[10px] text-slate-400 font-medium">{records.length} entries stored</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={records}
            emptyMessage="No attendance records found"
            className="bg-transparent"
          />
        )}
      </Card>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_ATTENDANCE">
          <button
            onClick={handleAddRecord}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </RoleGate>
      </div>

      <AttendanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
