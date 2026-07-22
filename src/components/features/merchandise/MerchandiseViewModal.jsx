import { Archive, ArchiveRestore, Pencil, PackageMinus, PackagePlus, Settings2, ShoppingCart, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  formatMerchandiseDate,
  formatMerchandisePrice,
  formatPaymentStatus,
  formatRequestStatus,
} from '@/config/merchandiseDisplay';
import {
  formatStockMovementLabel,
  getProductPrimaryImage,
  getProductTotalStock,
  getStockStatus,
  normalizeVariants,
} from '@/config/merchandiseOptions';

export default function MerchandiseViewModal({
  isOpen,
  onClose,
  product,
  sales = [],
  movements = [],
  requests = [],
  canManage = false,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onRecordSale,
  onAddStock,
  onRemoveStock,
  onAdjustStock,
}) {
  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = getProductPrimaryImage(product) || images[0]?.url || '';
  const variants = normalizeVariants(product.variants);
  const totalStock = getProductTotalStock(product);
  const stockStatus = getStockStatus(totalStock);

  const recentSales = sales
    .filter((sale) => sale.productId === product.id)
    .slice(0, 5);

  const recentMovements = movements
    .filter((movement) => movement.productId === product.id)
    .slice(0, 8);

  const relatedRequests = requests
    .filter((request) => request.productId === product.id && request.status === 'waiting')
    .slice(0, 5);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name || 'Merchandise Details'}
      maxWidth="max-w-4xl"
      panelClassName="p-4 md:p-5 space-y-5 max-h-[90vh] overflow-y-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        <div className="space-y-3">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image) => (
                <div key={image.storagePath || image.url} className="aspect-square rounded-lg overflow-hidden border border-slate-700">
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{product.category}</p>
              <h2 className="text-xl font-bold text-white mt-1">{product.name}</h2>
              <p className="text-indigo-300 font-semibold mt-2">{formatMerchandisePrice(product.sellingPrice)}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-600 text-slate-200">
              {stockStatus.indicator} {stockStatus.label} · {totalStock} units
            </span>
          </div>

          {product.description ? (
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{product.description}</p>
          ) : (
            <p className="text-sm text-slate-500">No description provided.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/60 border border-slate-700/70 rounded-lg p-3">
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Cost Price</p>
              <p className="text-slate-200 mt-1">{formatMerchandisePrice(product.costPrice)}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/70 rounded-lg p-3">
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Supplier</p>
              <p className="text-slate-200 mt-1">{product.supplier || '—'}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/70 rounded-lg p-3">
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Status</p>
              <p className="text-slate-200 mt-1 capitalize">{product.status || 'active'}</p>
            </div>
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={Pencil} onClick={() => onEdit?.(product)}>Edit</Button>
              <Button variant="success" icon={ShoppingCart} onClick={() => onRecordSale?.(product)}>Record Sale</Button>
              <Button variant="primary" icon={PackagePlus} onClick={() => onAddStock?.(product)}>Add Stock</Button>
              <Button variant="outline" icon={PackageMinus} onClick={() => onRemoveStock?.(product)}>Remove Stock</Button>
              <Button variant="outline" icon={Settings2} onClick={() => onAdjustStock?.(product)}>Adjust Stock</Button>
              {product.status === 'archived' ? (
                <Button variant="outline" icon={ArchiveRestore} onClick={() => onRestore?.(product)}>Restore</Button>
              ) : (
                <Button variant="outline" icon={Archive} onClick={() => onArchive?.(product)}>Archive</Button>
              )}
              <Button variant="danger" icon={Trash2} onClick={() => onDelete?.(product)}>Delete</Button>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Variant Breakdown</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-700/70">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400">
                <th className="px-3 py-2 text-left">Colour</th>
                <th className="px-3 py-2 text-left">Size</th>
                <th className="px-3 py-2 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-t border-slate-700/50 text-slate-300">
                  <td className="px-3 py-2">{variant.colour}</td>
                  <td className="px-3 py-2">{variant.size}</td>
                  <td className="px-3 py-2 font-semibold text-white">{variant.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Sales</h3>
          <div className="space-y-2">
            {recentSales.length ? recentSales.map((sale) => (
              <div key={sale.id} className="bg-slate-900/50 border border-slate-700/60 rounded-lg p-3 text-xs text-slate-300">
                <p className="font-semibold text-white">{sale.quantity} × {sale.colour} {sale.size}</p>
                <p className="mt-1">{formatMerchandiseDate(sale.saleDate)} · {formatPaymentStatus(sale.paymentStatus)}</p>
                <p className="text-slate-500 mt-1">{sale.buyerName || 'No buyer name'}</p>
              </div>
            )) : <p className="text-xs text-slate-500">No sales yet.</p>}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Stock Additions</h3>
          <div className="space-y-2">
            {recentMovements.length ? recentMovements.map((movement) => (
              <div key={movement.id} className="bg-slate-900/50 border border-slate-700/60 rounded-lg p-3 text-xs text-slate-300">
                <p className="font-semibold text-white">{formatStockMovementLabel(movement)}</p>
                <p className="mt-1 text-slate-500">{formatMerchandiseDate(movement.createdAt)}</p>
              </div>
            )) : <p className="text-xs text-slate-500">No stock movements yet.</p>}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Requests</h3>
          <div className="space-y-2">
            {relatedRequests.length ? relatedRequests.map((request) => (
              <div key={request.id} className="bg-slate-900/50 border border-slate-700/60 rounded-lg p-3 text-xs text-slate-300">
                <p className="font-semibold text-white">{request.requesterName}</p>
                <p className="mt-1">{request.quantity} × {request.colour} {request.size}</p>
                <p className="text-amber-300 mt-1">{formatRequestStatus(request.status)}</p>
              </div>
            )) : <p className="text-xs text-slate-500">No waiting requests.</p>}
          </div>
        </section>
      </div>
    </Modal>
  );
}
