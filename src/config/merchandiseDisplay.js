import { formatCurrencySimple, formatDate } from '@/utils/formatters';
import { safeToDate } from '@/utils/safeToDate';
import {
  getProductPrimaryImage,
  getProductTotalStock,
  getStockStatus,
} from '@/config/merchandiseOptions';

export function formatMerchandisePrice(amount) {
  if (amount == null || amount === '') return '—';
  return formatCurrencySimple(amount);
}

export function formatMerchandiseDate(value) {
  const date = safeToDate(value);
  if (!date) return '—';
  return formatDate(date.toISOString(), 'short');
}

export function formatPaymentStatus(status) {
  if (status === 'outstanding') return 'Outstanding';
  if (status === 'paid') return 'Paid';
  return status || '—';
}

export function formatRequestStatus(status) {
  const labels = {
    waiting: 'Waiting',
    contacted: 'Contacted',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
  };
  return labels[status] || status || '—';
}

export function getMerchandiseCardModel(product) {
  const totalStock = getProductTotalStock(product);
  const stockStatus = getStockStatus(totalStock);

  return {
    id: product.id,
    name: product.name || 'Untitled product',
    category: product.category || 'Uncategorised',
    imageUrl: getProductPrimaryImage(product),
    sellingPriceLabel: formatMerchandisePrice(product.sellingPrice),
    totalStock,
    stockStatus,
    status: product.status || 'active',
  };
}
