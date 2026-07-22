import Table from '@/components/ui/Table';
import { formatMerchandiseDate } from '@/config/merchandiseDisplay';
import { formatStockMovementLabel } from '@/config/merchandiseOptions';

const columns = [
  {
    key: 'createdAt',
    label: 'Date',
    render: (value) => formatMerchandiseDate(value),
  },
  {
    key: 'summary',
    label: 'Movement',
    render: (_value, row) => formatStockMovementLabel(row),
  },
  { key: 'productName', label: 'Product' },
  { key: 'colour', label: 'Colour' },
  { key: 'size', label: 'Size' },
  {
    key: 'quantityChange',
    label: 'Change',
    render: (value) => {
      const change = Number(value) || 0;
      return change > 0 ? `+${change}` : String(change);
    },
  },
  {
    key: 'createdBy',
    label: 'By',
    render: (value) => value || '—',
  },
];

export default function MerchandiseStockHistoryTable({
  movements = [],
  emptyMessage = 'No stock movements recorded yet.',
}) {
  return <Table columns={columns} data={movements} emptyMessage={emptyMessage} />;
}
