import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { formatMerchandiseDate, formatRequestStatus } from '@/config/merchandiseDisplay';
import { REQUEST_STATUS_OPTIONS } from '@/config/merchandiseOptions';

export default function MerchandiseRequestsPanel({
  requests = [],
  canManage = false,
  onStatusChange,
  onAddRequest,
  statusFilter,
  onStatusFilterChange,
}) {
  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => formatMerchandiseDate(value),
    },
    { key: 'requesterName', label: 'Name' },
    {
      key: 'contactNumber',
      label: 'Contact',
      render: (value) => value || '—',
    },
    { key: 'productName', label: 'Product' },
    { key: 'colour', label: 'Colour' },
    { key: 'size', label: 'Size' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        canManage ? (
          <select
            value={value}
            onChange={(event) => onStatusChange?.(row, event.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
          >
            {REQUEST_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : formatRequestStatus(value)
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value) => value || '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <Select
          label="Filter by status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange?.(event.target.value)}
          options={[{ value: 'all', label: 'All statuses' }, ...REQUEST_STATUS_OPTIONS]}
        />
        {canManage && (
          <Button onClick={onAddRequest}>+ Record Request</Button>
        )}
      </div>
      <Table
        columns={columns}
        data={requests}
        emptyMessage="No merchandise requests yet."
      />
    </div>
  );
}
