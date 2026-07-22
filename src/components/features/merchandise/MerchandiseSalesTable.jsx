import Table from '@/components/ui/Table';
import {
  formatMerchandiseDate,
  formatPaymentStatus,
} from '@/config/merchandiseDisplay';

const columns = [
  {
    key: 'saleDate',
    label: 'Date',
    render: (value) => formatMerchandiseDate(value),
  },
  { key: 'productName', label: 'Product' },
  { key: 'colour', label: 'Colour' },
  { key: 'size', label: 'Size' },
  { key: 'quantity', label: 'Qty' },
  {
    key: 'buyerName',
    label: 'Buyer',
    render: (value) => value || '—',
  },
  {
    key: 'paymentStatus',
    label: 'Payment',
    render: (value) => formatPaymentStatus(value),
  },
  {
    key: 'soldBy',
    label: 'Sold By',
    render: (value) => value || '—',
  },
];

export default function MerchandiseSalesTable({ sales = [], emptyMessage = 'No sales recorded yet.' }) {
  return <Table columns={columns} data={sales} emptyMessage={emptyMessage} />;
}
