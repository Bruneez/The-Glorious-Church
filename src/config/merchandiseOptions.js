export const MERCHANDISE_CATEGORY_OPTIONS = [
  { value: 'T-Shirt', label: 'T-Shirt' },
  { value: 'Sweatshirt', label: 'Sweatshirt' },
  { value: 'Crewneck', label: 'Crewneck' },
];

export const MERCHANDISE_COLOUR_OPTIONS = [
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' },
  { value: 'Navy', label: 'Navy' },
  { value: 'Red', label: 'Red' },
  { value: 'Yellow', label: 'Yellow' },
  { value: 'Green', label: 'Green' },
  { value: 'Purple', label: 'Purple' },
];

export const MERCHANDISE_SIZE_OPTIONS = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'outstanding', label: 'Outstanding' },
];

export const REQUEST_STATUS_OPTIONS = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const STOCK_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All stock statuses' },
  { value: 'in', label: 'In Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
];

export const LOW_STOCK_THRESHOLD = 5;

export const ACCEPTED_MERCHANDISE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_MERCHANDISE_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_MERCHANDISE_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_MERCHANDISE_IMAGES = 5;

export const MERCHANDISE_IMAGE_UPLOAD_TIMEOUT_MS = 30_000;

export const MERCHANDISE_TABS = [
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'requests', label: 'Requests' },
  { id: 'sales', label: 'Sales History' },
  { id: 'stock', label: 'Stock History' },
  { id: 'reports', label: 'Reports' },
];

export function isPermanentImageUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  return !value.startsWith('blob:') && !value.startsWith('data:');
}

export function validateMerchandiseImageFile(file) {
  if (!file) return '';

  if (file.size > MAX_MERCHANDISE_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.';
  }

  const hasAllowedType = ACCEPTED_MERCHANDISE_IMAGE_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  return '';
}

export function makeVariantId(colour, size) {
  return `${String(colour || '').trim().toLowerCase()}__${String(size || '').trim().toLowerCase()}`;
}

export function normalizeVariants(variants = []) {
  if (!Array.isArray(variants)) return [];

  const byId = new Map();

  variants.forEach((variant) => {
    const colour = String(variant?.colour || '').trim();
    const size = String(variant?.size || '').trim();
    if (!colour || !size) return;

    const id = String(variant?.id || makeVariantId(colour, size));
    const quantity = Math.max(0, Number.parseInt(variant?.quantity, 10) || 0);
    const existing = byId.get(id);

    if (existing) {
      existing.quantity += quantity;
      return;
    }

    byId.set(id, { id, colour, size, quantity });
  });

  return Array.from(byId.values()).sort((a, b) => {
    const colourCompare = a.colour.localeCompare(b.colour);
    if (colourCompare !== 0) return colourCompare;
    return a.size.localeCompare(b.size);
  });
}

export function getProductTotalStock(product) {
  return normalizeVariants(product?.variants).reduce((sum, variant) => sum + variant.quantity, 0);
}

export function getStockStatus(totalQuantity) {
  const quantity = Number(totalQuantity) || 0;

  if (quantity <= 0) {
    return { key: 'out', label: 'Out of Stock', tone: 'rose', indicator: '🔴' };
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return { key: 'low', label: 'Low Stock', tone: 'amber', indicator: '🟡' };
  }

  return { key: 'in', label: 'In Stock', tone: 'emerald', indicator: '🟢' };
}

export function getProductPrimaryImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const first = images.find((image) => isPermanentImageUrl(image?.url));
  return first?.url || '';
}

export function mapMerchandiseToFormData(product) {
  if (!product) {
    return {
      name: '',
      category: 'T-Shirt',
      description: '',
      sellingPrice: '',
      costPrice: '',
      supplier: '',
      status: 'active',
      variants: [{ colour: 'Black', size: 'M', quantity: '0' }],
      images: [],
    };
  }

  return {
    name: product.name || '',
    category: product.category || '',
    description: product.description || '',
    sellingPrice: product.sellingPrice != null ? String(product.sellingPrice) : '',
    costPrice: product.costPrice != null && product.costPrice !== '' ? String(product.costPrice) : '',
    supplier: product.supplier || '',
    status: product.status || 'active',
    variants: normalizeVariants(product.variants).map((variant) => ({
      colour: variant.colour,
      size: variant.size,
      quantity: String(variant.quantity),
    })),
    images: Array.isArray(product.images) ? product.images : [],
  };
}

export function validateMerchandiseForm(formData, { requireImage = false } = {}) {
  if (!String(formData.name || '').trim()) {
    return 'Product name is required.';
  }

  if (!String(formData.category || '').trim()) {
    return 'Category is required.';
  }

  const sellingPrice = Number.parseFloat(formData.sellingPrice);
  if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
    return 'Enter a valid selling price.';
  }

  if (formData.costPrice !== '' && formData.costPrice != null) {
    const costPrice = Number.parseFloat(formData.costPrice);
    if (Number.isNaN(costPrice) || costPrice < 0) {
      return 'Enter a valid cost price, or leave it blank.';
    }
  }

  const variants = normalizeVariants(
    (formData.variants || []).map((variant) => ({
      ...variant,
      quantity: Number.parseInt(variant.quantity, 10) || 0,
    })),
  );

  if (!variants.length) {
    return 'Add at least one colour and size variant.';
  }

  if (requireImage) {
    const hasExistingImage = Array.isArray(formData.images)
      && formData.images.some((image) => isPermanentImageUrl(image?.url));
    if (!hasExistingImage) {
      return 'At least one product image is required.';
    }
  }

  return '';
}

export function buildMerchandisePayload(formData, { createdBy = '' } = {}) {
  const variants = normalizeVariants(
    (formData.variants || []).map((variant) => ({
      ...variant,
      quantity: Number.parseInt(variant.quantity, 10) || 0,
    })),
  );

  const sellingPrice = Number.parseFloat(formData.sellingPrice) || 0;
  const costRaw = String(formData.costPrice ?? '').trim();
  const costPrice = costRaw === '' ? null : Number.parseFloat(costRaw);

  const images = (Array.isArray(formData.images) ? formData.images : [])
    .filter((image) => isPermanentImageUrl(image?.url))
    .map((image) => ({
      url: String(image.url).trim(),
      storagePath: String(image.storagePath || '').trim(),
    }));

  return {
    name: String(formData.name || '').trim(),
    category: String(formData.category || '').trim(),
    description: String(formData.description || '').trim(),
    sellingPrice,
    costPrice: Number.isNaN(costPrice) ? null : costPrice,
    supplier: String(formData.supplier || '').trim(),
    status: formData.status === 'archived' ? 'archived' : 'active',
    variants,
    images,
    createdBy: String(createdBy || formData.createdBy || '').trim(),
  };
}

export function filterMerchandiseProducts(products = [], filters = {}) {
  const search = String(filters.search || '').trim().toLowerCase();
  const category = String(filters.category || '').trim();
  const colour = String(filters.colour || '').trim().toLowerCase();
  const size = String(filters.size || '').trim().toLowerCase();
  const stockStatus = String(filters.stockStatus || 'all').trim();
  const includeArchived = Boolean(filters.includeArchived);

  return products.filter((product) => {
    if (!includeArchived && product.status === 'archived') return false;
    if (includeArchived && filters.statusOnly === 'archived' && product.status !== 'archived') {
      return false;
    }

    if (category && category !== 'all' && product.category !== category) return false;

    const variants = normalizeVariants(product.variants);
    if (colour && colour !== 'all' && !variants.some((variant) => variant.colour.toLowerCase() === colour)) {
      return false;
    }
    if (size && size !== 'all' && !variants.some((variant) => variant.size.toLowerCase() === size)) {
      return false;
    }

    const totalStock = getProductTotalStock(product);
    const status = getStockStatus(totalStock);
    if (stockStatus !== 'all' && status.key !== stockStatus) return false;

    if (!search) return true;

    const haystack = [
      product.name,
      product.category,
      product.description,
      product.supplier,
      ...variants.map((variant) => `${variant.colour} ${variant.size}`),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function toDateValue(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isSameMonth(date, reference = new Date()) {
  if (!date) return false;
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export function buildMerchandiseSummary({
  products = [],
  sales = [],
  requests = [],
  now = new Date(),
} = {}) {
  const activeProducts = products.filter((product) => product.status !== 'archived');
  const totalProducts = activeProducts.length;
  const totalStock = activeProducts.reduce((sum, product) => sum + getProductTotalStock(product), 0);

  const itemsSoldThisMonth = sales
    .filter((sale) => isSameMonth(toDateValue(sale.saleDate || sale.createdAt), now))
    .reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0);

  const pendingRequests = requests.filter((request) => request.status === 'waiting').length;

  const lowStockItems = activeProducts.filter((product) => {
    const status = getStockStatus(getProductTotalStock(product));
    return status.key === 'low' || status.key === 'out';
  }).length;

  const totalMerchandiseValue = activeProducts.reduce((sum, product) => {
    const price = Number(product.sellingPrice) || 0;
    return sum + price * getProductTotalStock(product);
  }, 0);

  return {
    totalProducts,
    totalStock,
    itemsSoldThisMonth,
    pendingRequests,
    lowStockItems,
    totalMerchandiseValue,
  };
}

export function buildMerchandiseReportStats({ products = [], sales = [], now = new Date() } = {}) {
  const activeProducts = products.filter((product) => product.status !== 'archived');
  const productSales = new Map();
  const sizeSales = new Map();
  const colourSales = new Map();
  const monthlySales = new Map();
  const monthlyStockAdded = new Map();

  sales.forEach((sale) => {
    const quantity = Number(sale.quantity) || 0;
    const productName = sale.productName || 'Unknown';
    productSales.set(productName, (productSales.get(productName) || 0) + quantity);
    sizeSales.set(sale.size || '—', (sizeSales.get(sale.size || '—') || 0) + quantity);
    colourSales.set(sale.colour || '—', (colourSales.get(sale.colour || '—') || 0) + quantity);

    const date = toDateValue(sale.saleDate || sale.createdAt);
    if (date) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySales.set(key, (monthlySales.get(key) || 0) + quantity);
    }
  });

  const inventoryValue = activeProducts.reduce((sum, product) => {
    return sum + (Number(product.sellingPrice) || 0) * getProductTotalStock(product);
  }, 0);

  const lowStock = [];
  const outOfStock = [];

  activeProducts.forEach((product) => {
    const total = getProductTotalStock(product);
    const status = getStockStatus(total);
    if (status.key === 'out') outOfStock.push(product);
    if (status.key === 'low') lowStock.push(product);
  });

  const toRanked = (map, limit = 5) =>
    Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

  return {
    mostPopularProducts: toRanked(productSales),
    bestSellingSizes: toRanked(sizeSales),
    bestSellingColours: toRanked(colourSales),
    monthlySales: toRanked(monthlySales, 6).reverse(),
    monthlyStockAdded,
    inventoryValue,
    lowStock,
    outOfStock,
    now,
  };
}

export function filterSalesHistory(sales = [], search = '') {
  const term = String(search || '').trim().toLowerCase();
  if (!term) return sales;

  return sales.filter((sale) => {
    const haystack = [
      sale.productName,
      sale.colour,
      sale.size,
      sale.buyerName,
      sale.paymentStatus,
      sale.soldBy,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function filterStockMovements(movements = [], search = '') {
  const term = String(search || '').trim().toLowerCase();
  if (!term) return movements;

  return movements.filter((movement) => {
    const haystack = [
      movement.productName,
      movement.colour,
      movement.size,
      movement.type,
      movement.reason,
      movement.createdBy,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function filterMerchandiseRequests(requests = [], search = '', status = 'all') {
  const term = String(search || '').trim().toLowerCase();

  return requests.filter((request) => {
    if (status !== 'all' && request.status !== status) return false;
    if (!term) return true;

    const haystack = [
      request.requesterName,
      request.contactNumber,
      request.productName,
      request.colour,
      request.size,
      request.notes,
      request.status,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function getEmptyMerchandiseMessage(searchTerm, canManage) {
  if (String(searchTerm || '').trim()) {
    return 'No merchandise matches your search.';
  }

  if (canManage) {
    return 'No merchandise has been added yet. Add your first product to start tracking stock.';
  }

  return 'No merchandise has been added yet.';
}

export function formatStockMovementLabel(movement) {
  const quantity = Number(movement.quantityChange) || 0;
  const signed = quantity > 0 ? `+${quantity}` : String(quantity);
  const colour = movement.colour || '';
  const size = movement.size || '';
  const productName = movement.productName || 'Item';
  const typeLabel = movement.reason || movement.type || 'Updated';

  return `${signed} ${colour} ${size} ${productName} — ${typeLabel}`.replace(/\s+/g, ' ').trim();
}
