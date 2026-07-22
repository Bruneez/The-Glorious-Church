import { formatMerchandisePrice } from '@/config/merchandiseDisplay';
import { buildMerchandiseSummary } from '@/config/merchandiseOptions';

function SummaryCard({ label, value, loading, highlight = false }) {
  return (
    <div
      className={`p-4 md:p-5 rounded-xl border shadow-sm ${
        highlight
          ? 'bg-amber-950/30 border-amber-500/30'
          : 'bg-slate-800 border-slate-700/70'
      }`}
    >
      <h3
        className={`text-xl md:text-2xl font-bold ${
          highlight ? 'text-amber-300' : 'text-indigo-400'
        }`}
      >
        {loading ? '—' : value}
      </h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function MerchandiseSummaryCards({
  products = [],
  sales = [],
  requests = [],
  loading = false,
}) {
  const summary = buildMerchandiseSummary({ products, sales, requests });

  const cards = [
    { key: 'products', label: 'Total Products', value: summary.totalProducts },
    { key: 'stock', label: 'Total Stock Available', value: summary.totalStock },
    { key: 'sold', label: 'Items Sold This Month', value: summary.itemsSoldThisMonth },
    {
      key: 'requests',
      label: 'Pending Requests',
      value: summary.pendingRequests,
      highlight: summary.pendingRequests > 0,
    },
    {
      key: 'low',
      label: 'Low Stock Items',
      value: summary.lowStockItems,
      highlight: summary.lowStockItems > 0,
    },
    {
      key: 'value',
      label: 'Total Merchandise Value',
      value: formatMerchandisePrice(summary.totalMerchandiseValue),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          value={card.value}
          loading={loading}
          highlight={card.highlight}
        />
      ))}
    </div>
  );
}
