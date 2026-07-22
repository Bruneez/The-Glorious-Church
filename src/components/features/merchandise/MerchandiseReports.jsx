import { formatMerchandisePrice } from '@/config/merchandiseDisplay';
import { buildMerchandiseReportStats, getProductTotalStock } from '@/config/merchandiseOptions';

function RankBar({ label, value, max }) {
  const width = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-300 truncate">{label}</span>
        <span className="text-indigo-300 font-semibold shrink-0">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ReportCard({ title, children }) {
  return (
    <section className="bg-slate-800 rounded-xl border border-slate-700/70 p-4 md:p-5 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

export default function MerchandiseReports({ products = [], sales = [] }) {
  const stats = buildMerchandiseReportStats({ products, sales });
  const popularMax = stats.mostPopularProducts[0]?.value || 0;
  const sizeMax = stats.bestSellingSizes[0]?.value || 0;
  const colourMax = stats.bestSellingColours[0]?.value || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Inventory Value</p>
          <p className="text-2xl font-bold text-indigo-300 mt-2">{formatMerchandisePrice(stats.inventoryValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-amber-500/20 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Running Low</p>
          <p className="text-2xl font-bold text-amber-300 mt-2">{stats.lowStock.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-rose-500/20 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Out of Stock</p>
          <p className="text-2xl font-bold text-rose-300 mt-2">{stats.outOfStock.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-emerald-500/20 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Sales Units</p>
          <p className="text-2xl font-bold text-emerald-300 mt-2">
            {sales.reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ReportCard title="Most Popular Products">
          {stats.mostPopularProducts.length ? (
            <div className="space-y-3">
              {stats.mostPopularProducts.map((item) => (
                <RankBar key={item.label} label={item.label} value={item.value} max={popularMax} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No sales data yet.</p>
          )}
        </ReportCard>

        <ReportCard title="Best Selling Sizes">
          {stats.bestSellingSizes.length ? (
            <div className="space-y-3">
              {stats.bestSellingSizes.map((item) => (
                <RankBar key={item.label} label={item.label} value={item.value} max={sizeMax} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No size sales yet.</p>
          )}
        </ReportCard>

        <ReportCard title="Best Selling Colours">
          {stats.bestSellingColours.length ? (
            <div className="space-y-3">
              {stats.bestSellingColours.map((item) => (
                <RankBar key={item.label} label={item.label} value={item.value} max={colourMax} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No colour sales yet.</p>
          )}
        </ReportCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard title="Products Running Low">
          {stats.lowStock.length ? (
            <ul className="space-y-2">
              {stats.lowStock.map((product) => (
                <li key={product.id} className="flex justify-between gap-3 text-xs text-slate-300">
                  <span>{product.name}</span>
                  <span className="text-amber-300 font-semibold">{getProductTotalStock(product)} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No low-stock products.</p>
          )}
        </ReportCard>

        <ReportCard title="Products Out of Stock">
          {stats.outOfStock.length ? (
            <ul className="space-y-2">
              {stats.outOfStock.map((product) => (
                <li key={product.id} className="text-xs text-rose-300">{product.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No out-of-stock products.</p>
          )}
        </ReportCard>
      </div>
    </div>
  );
}
