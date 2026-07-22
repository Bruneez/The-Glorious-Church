import { Eye, Pencil, PackagePlus, ShoppingCart } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getMerchandiseCardModel } from '@/config/merchandiseDisplay';

const STATUS_STYLES = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  amber: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function MerchandiseCardGrid({
  products = [],
  canManage = false,
  emptyMessage = 'No merchandise has been added yet.',
  onView,
  onEdit,
  onRecordSale,
  onAddStock,
}) {
  if (!products.length) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-10 text-center">
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => {
        const card = getMerchandiseCardModel(product);
        const statusClass = STATUS_STYLES[card.stockStatus.tone] || STATUS_STYLES.emerald;

        return (
          <article
            key={product.id}
            className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm hover:border-indigo-500/40 hover:-translate-y-0.5 transition duration-200 flex flex-col"
          >
            <button
              type="button"
              onClick={() => onView?.(product)}
              className="relative aspect-[4/3] bg-slate-900 overflow-hidden text-left"
            >
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                  No image
                </div>
              )}
              {card.status === 'archived' && (
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md bg-slate-950/80 text-slate-300 border border-slate-600">
                  Archived
                </span>
              )}
            </button>

            <div className="p-4 flex flex-col gap-3 flex-1">
              <div>
                <h3 className="text-sm font-semibold text-white line-clamp-2">{card.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{card.category}</p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-indigo-300">{card.sellingPriceLabel}</p>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${statusClass}`}>
                  {card.stockStatus.indicator} {card.stockStatus.label}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Stock: <span className="font-semibold text-white">{card.totalStock}</span>
              </p>

              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="!py-2 !px-2 !shadow-none"
                  icon={Eye}
                  onClick={() => onView?.(product)}
                >
                  View
                </Button>
                {canManage ? (
                  <>
                    <Button
                      variant="secondary"
                      className="!py-2 !px-2 !shadow-none"
                      icon={Pencil}
                      onClick={() => onEdit?.(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="success"
                      className="!py-2 !px-2 !shadow-none"
                      icon={ShoppingCart}
                      onClick={() => onRecordSale?.(product)}
                    >
                      Record Sale
                    </Button>
                    <Button
                      variant="primary"
                      className="!py-2 !px-2 !shadow-none"
                      icon={PackagePlus}
                      onClick={() => onAddStock?.(product)}
                    >
                      Add Stock
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
