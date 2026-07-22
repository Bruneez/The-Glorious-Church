import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMerchandisePayload,
  buildMerchandiseSummary,
  filterMerchandiseProducts,
  getProductTotalStock,
  getStockStatus,
  makeVariantId,
  normalizeVariants,
  validateMerchandiseForm,
  validateMerchandiseImageFile,
} from './merchandiseOptions.js';

test('validateMerchandiseImageFile accepts jpeg, png, and webp', () => {
  assert.equal(validateMerchandiseImageFile({ name: 'a.jpg', type: 'image/jpeg', size: 1000 }), '');
  assert.equal(validateMerchandiseImageFile({ name: 'a.png', type: 'image/png', size: 1000 }), '');
  assert.equal(validateMerchandiseImageFile({ name: 'a.webp', type: 'image/webp', size: 1000 }), '');
});

test('validateMerchandiseImageFile rejects unsupported types and oversized files', () => {
  assert.match(
    validateMerchandiseImageFile({ name: 'a.gif', type: 'image/gif', size: 1000 }),
    /JPG, PNG, or WEBP/i,
  );
  assert.match(
    validateMerchandiseImageFile({ name: 'a.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 }),
    /5 MB/i,
  );
});

test('validateMerchandiseForm requires name, price, variants, and image when requested', () => {
  assert.match(validateMerchandiseForm({}), /Product name/i);
  assert.match(
    validateMerchandiseForm({
      name: 'Tee',
      category: 'T-Shirt',
      sellingPrice: '100',
      variants: [],
    }),
    /variant/i,
  );
  assert.match(
    validateMerchandiseForm(
      {
        name: 'Tee',
        category: 'T-Shirt',
        sellingPrice: '100',
        variants: [{ colour: 'Black', size: 'M', quantity: 2 }],
        images: [],
      },
      { requireImage: true },
    ),
    /image/i,
  );
});

test('buildMerchandisePayload normalizes variants and prices', () => {
  const payload = buildMerchandisePayload({
    name: ' Classic Tee ',
    category: 'T-Shirt',
    description: 'Soft cotton',
    sellingPrice: '150.5',
    costPrice: '80',
    supplier: 'Local Print',
    status: 'active',
    variants: [
      { colour: 'Black', size: 'M', quantity: '5' },
      { colour: 'Black', size: 'M', quantity: '3' },
    ],
    images: [{ url: 'https://example.com/a.jpg', storagePath: 'merchandise/1/a.jpg' }],
  }, { createdBy: 'Admin' });

  assert.equal(payload.name, 'Classic Tee');
  assert.equal(payload.sellingPrice, 150.5);
  assert.equal(payload.costPrice, 80);
  assert.equal(payload.variants.length, 1);
  assert.equal(payload.variants[0].quantity, 8);
  assert.equal(payload.variants[0].id, makeVariantId('Black', 'M'));
  assert.equal(payload.createdBy, 'Admin');
});

test('normalizeVariants and stock helpers classify inventory correctly', () => {
  const variants = normalizeVariants([
    { colour: 'Red', size: 'L', quantity: 2 },
    { colour: 'Red', size: 'L', quantity: 1 },
  ]);
  assert.equal(variants[0].quantity, 3);
  assert.equal(getProductTotalStock({ variants }), 3);
  assert.equal(getStockStatus(0).key, 'out');
  assert.equal(getStockStatus(3).key, 'low');
  assert.equal(getStockStatus(20).key, 'in');
});

test('filterMerchandiseProducts searches and respects filters', () => {
  const products = [
    {
      id: '1',
      name: 'Black Tee',
      category: 'T-Shirt',
      description: 'Camp wear',
      status: 'active',
      variants: [{ colour: 'Black', size: 'M', quantity: 10 }],
    },
    {
      id: '2',
      name: 'Navy Crew',
      category: 'Crewneck',
      description: 'Warm',
      status: 'archived',
      variants: [{ colour: 'Navy', size: 'L', quantity: 0 }],
    },
  ];

  assert.equal(filterMerchandiseProducts(products, { search: 'camp' }).length, 1);
  assert.equal(filterMerchandiseProducts(products, { category: 'Crewneck', includeArchived: true }).length, 1);
  assert.equal(filterMerchandiseProducts(products, { stockStatus: 'out', includeArchived: true }).length, 1);
  assert.equal(filterMerchandiseProducts(products, { colour: 'black' })[0].id, '1');
});

test('buildMerchandiseSummary aggregates dashboard metrics', () => {
  const now = new Date('2026-07-15T12:00:00Z');
  const summary = buildMerchandiseSummary({
    products: [
      {
        status: 'active',
        sellingPrice: 100,
        variants: [{ colour: 'Black', size: 'M', quantity: 4 }],
      },
      {
        status: 'archived',
        sellingPrice: 50,
        variants: [{ colour: 'White', size: 'S', quantity: 20 }],
      },
    ],
    sales: [
      { quantity: 2, saleDate: new Date('2026-07-02T10:00:00Z') },
      { quantity: 5, saleDate: new Date('2026-06-02T10:00:00Z') },
    ],
    requests: [
      { status: 'waiting' },
      { status: 'fulfilled' },
    ],
    now,
  });

  assert.equal(summary.totalProducts, 1);
  assert.equal(summary.totalStock, 4);
  assert.equal(summary.itemsSoldThisMonth, 2);
  assert.equal(summary.pendingRequests, 1);
  assert.equal(summary.lowStockItems, 1);
  assert.equal(summary.totalMerchandiseValue, 400);
});
