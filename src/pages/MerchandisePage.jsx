import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import MerchandiseSummaryCards from '@/components/features/merchandise/MerchandiseSummaryCards';
import MerchandiseCardGrid from '@/components/features/merchandise/MerchandiseCardGrid';
import MerchandiseForm from '@/components/features/merchandise/MerchandiseForm';
import MerchandiseViewModal from '@/components/features/merchandise/MerchandiseViewModal';
import MerchandiseDeleteModal from '@/components/features/merchandise/MerchandiseDeleteModal';
import MerchandiseSaleForm from '@/components/features/merchandise/MerchandiseSaleForm';
import MerchandiseStockForm from '@/components/features/merchandise/MerchandiseStockForm';
import MerchandiseRequestForm from '@/components/features/merchandise/MerchandiseRequestForm';
import MerchandiseSalesTable from '@/components/features/merchandise/MerchandiseSalesTable';
import MerchandiseStockHistoryTable from '@/components/features/merchandise/MerchandiseStockHistoryTable';
import MerchandiseRequestsPanel from '@/components/features/merchandise/MerchandiseRequestsPanel';
import MerchandiseReports from '@/components/features/merchandise/MerchandiseReports';
import {
  MERCHANDISE_CATEGORY_OPTIONS,
  MERCHANDISE_COLOUR_OPTIONS,
  MERCHANDISE_SIZE_OPTIONS,
  MERCHANDISE_TABS,
  STOCK_STATUS_FILTER_OPTIONS,
  filterMerchandiseProducts,
  filterMerchandiseRequests,
  filterSalesHistory,
  filterStockMovements,
  getEmptyMerchandiseMessage,
} from '@/config/merchandiseOptions';
import {
  adjustMerchandiseStock,
  createMerchandiseProduct,
  createMerchandiseRequest,
  deleteMerchandiseProduct,
  recordMerchandiseSale,
  setMerchandiseProductStatus,
  updateMerchandiseProduct,
  updateMerchandiseRequestStatus,
  useMerchandiseProducts,
  useMerchandiseRequests,
  useMerchandiseSales,
  useMerchandiseStockMovements,
} from '@/services/merchandiseService';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const toneClass =
    feedback.type === 'success'
      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      : feedback.type === 'warning'
        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400';

  return (
    <div className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${toneClass}`}>
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function MerchandisePage() {
  const { data: products = [], loading: productsLoading, error: productsError } = useMerchandiseProducts();
  const { data: sales = [], loading: salesLoading } = useMerchandiseSales();
  const { data: movements = [], loading: movementsLoading } = useMerchandiseStockMovements();
  const { data: requests = [], loading: requestsLoading } = useMerchandiseRequests();

  const { staffProfile, firebaseUser, role } = useAuth();
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_MERCHANDISE');

  const [activeTab, setActiveTab] = useState('catalogue');
  const [searchTerm, setSearchTerm] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [filters, setFilters] = useState({
    category: 'all',
    colour: 'all',
    size: 'all',
    stockStatus: 'all',
    includeArchived: false,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [saleProduct, setSaleProduct] = useState(null);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockMode, setStockMode] = useState('add');
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const createdBy =
    staffProfile?.fullName
    || staffProfile?.name
    || firebaseUser?.displayName
    || firebaseUser?.email
    || 'Admin';

  const customCategories = useMemo(() => {
    const defaults = new Set(MERCHANDISE_CATEGORY_OPTIONS.map((option) => option.value));
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
      .filter((category) => !defaults.has(category));
  }, [products]);

  const customColours = useMemo(() => {
    const defaults = new Set(MERCHANDISE_COLOUR_OPTIONS.map((option) => option.value));
    const colours = products.flatMap((product) =>
      (product.variants || []).map((variant) => variant.colour),
    );
    return [...new Set(colours.filter(Boolean))].filter((colour) => !defaults.has(colour));
  }, [products]);

  const filteredProducts = useMemo(
    () => filterMerchandiseProducts(products, { ...filters, search: searchTerm }),
    [products, filters, searchTerm],
  );

  const filteredSales = useMemo(
    () => filterSalesHistory(sales, salesSearch),
    [sales, salesSearch],
  );

  const filteredMovements = useMemo(
    () => filterStockMovements(movements, stockSearch),
    [movements, stockSearch],
  );

  const filteredRequests = useMemo(
    () => filterMerchandiseRequests(requests, requestSearch, requestStatusFilter),
    [requests, requestSearch, requestStatusFilter],
  );

  const emptyMessage = getEmptyMerchandiseMessage(searchTerm, canManage);
  const loading = productsLoading || salesLoading || movementsLoading || requestsLoading;

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openAddForm = () => {
    if (!canManage) return;
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    if (!canManage) return;
    setViewingProduct(null);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openSaleForm = (product = null) => {
    if (!canManage) return;
    setSaleProduct(product);
    setIsSaleOpen(true);
  };

  const openStockForm = (product, mode = 'add') => {
    if (!canManage) return;
    setStockProduct(product);
    setStockMode(mode);
    setIsStockOpen(true);
  };

  const handleFormSubmit = async ({ formData, imageFiles, removedImagePaths }) => {
    if (!canManage) throw new Error('You do not have permission to manage Merchandise.');

    if (editingProduct) {
      const { storageWarnings = [] } = await updateMerchandiseProduct(editingProduct.id, formData, {
        role,
        createdBy,
        initialData: editingProduct,
        imageFiles,
        removedImagePaths,
      });
      showFeedback(
        storageWarnings.length ? 'warning' : 'success',
        storageWarnings.length
          ? `Product updated. ${storageWarnings.join(' ')}`
          : 'Product updated successfully.',
      );
    } else {
      const { storageWarnings = [] } = await createMerchandiseProduct(formData, {
        role,
        createdBy,
        imageFiles,
      });
      showFeedback(
        storageWarnings.length ? 'warning' : 'success',
        storageWarnings.length
          ? `Product added. ${storageWarnings.join(' ')}`
          : 'Product added successfully.',
      );
    }

    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async () => {
    if (!canManage || !deletingProduct) return;
    setIsDeleting(true);
    try {
      const { storageWarnings = [] } = await deleteMerchandiseProduct(deletingProduct.id, {
        role,
        initialData: deletingProduct,
      });
      showFeedback(
        storageWarnings.length ? 'warning' : 'success',
        storageWarnings.length
          ? `Product deleted. ${storageWarnings.join(' ')}`
          : 'Product deleted successfully.',
      );
      setDeletingProduct(null);
      setViewingProduct(null);
    } catch (error) {
      showFeedback('error', error.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async (product) => {
    if (!canManage) return;
    await setMerchandiseProductStatus(product.id, 'archived', { role });
    showFeedback('success', 'Product archived.');
    setViewingProduct(null);
  };

  const handleRestore = async (product) => {
    if (!canManage) return;
    await setMerchandiseProductStatus(product.id, 'active', { role });
    showFeedback('success', 'Product restored to the catalogue.');
    setViewingProduct(null);
  };

  const handleSaleSubmit = async (formData) => {
    await recordMerchandiseSale(formData, { role, soldBy: createdBy });
    showFeedback('success', 'Sale recorded and stock updated.');
    setIsSaleOpen(false);
    setSaleProduct(null);
  };

  const handleStockSubmit = async (formData) => {
    await adjustMerchandiseStock(
      stockProduct.id,
      {
        colour: formData.colour,
        size: formData.size,
        quantityChange: formData.quantityChange,
        type: formData.type,
        reason: formData.reason || formData.type,
        createdBy,
      },
      { role },
    );
    showFeedback('success', 'Stock updated successfully.');
    setIsStockOpen(false);
    setStockProduct(null);
  };

  const handleRequestSubmit = async (formData) => {
    await createMerchandiseRequest(formData, { role, createdBy });
    showFeedback('success', 'Request recorded.');
    setIsRequestOpen(false);
  };

  const handleRequestStatusChange = async (request, status) => {
    if (!canManage) return;
    await updateMerchandiseRequestStatus(request.id, status, { role });
    showFeedback('success', 'Request status updated.');
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Merchandise</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Track church merchandise inventory, sales, stock movements and member requests.
          </p>
        </div>
        {canManage && activeTab === 'catalogue' && (
          <Button icon={Plus} onClick={openAddForm}>
            Add Merchandise
          </Button>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      {productsError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {productsError.message || 'Unable to load merchandise.'}
        </div>
      )}

      <MerchandiseSummaryCards
        products={products}
        sales={sales}
        requests={requests}
        loading={loading}
      />

      <div
        role="tablist"
        aria-label="Merchandise sections"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {MERCHANDISE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-3 md:p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search merchandise…"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Select
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                options={[{ value: 'all', label: 'All categories' }, ...MERCHANDISE_CATEGORY_OPTIONS, ...customCategories.map((value) => ({ value, label: value }))]}
              />
              <Select
                label="Colour"
                name="colour"
                value={filters.colour}
                onChange={handleFilterChange}
                options={[{ value: 'all', label: 'All colours' }, ...MERCHANDISE_COLOUR_OPTIONS, ...customColours.map((value) => ({ value, label: value }))]}
              />
              <Select
                label="Size"
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                options={[{ value: 'all', label: 'All sizes' }, ...MERCHANDISE_SIZE_OPTIONS]}
              />
              <Select
                label="Stock Status"
                name="stockStatus"
                value={filters.stockStatus}
                onChange={handleFilterChange}
                options={STOCK_STATUS_FILTER_OPTIONS}
              />
              <label className="flex items-end gap-2 text-xs text-slate-300 pb-2">
                <input
                  type="checkbox"
                  name="includeArchived"
                  checked={filters.includeArchived}
                  onChange={handleFilterChange}
                  className="rounded border-slate-600 bg-slate-900"
                />
                Show archived
              </label>
            </div>
          </div>

          <MerchandiseCardGrid
            products={filteredProducts}
            canManage={canManage}
            emptyMessage={emptyMessage}
            onView={setViewingProduct}
            onEdit={openEditForm}
            onRecordSale={openSaleForm}
            onAddStock={(product) => openStockForm(product, 'add')}
          />

          {!filteredProducts.length && canManage && !searchTerm && (
            <div className="flex justify-center">
              <Button icon={Plus} onClick={openAddForm}>
                Add Merchandise
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="search"
              value={requestSearch}
              onChange={(event) => setRequestSearch(event.target.value)}
              placeholder="Search requests…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <MerchandiseRequestsPanel
            requests={filteredRequests}
            canManage={canManage}
            onStatusChange={handleRequestStatusChange}
            onAddRequest={() => setIsRequestOpen(true)}
            statusFilter={requestStatusFilter}
            onStatusFilterChange={setRequestStatusFilter}
          />
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="search"
                value={salesSearch}
                onChange={(event) => setSalesSearch(event.target.value)}
                placeholder="Search sales…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {canManage && (
              <Button onClick={() => openSaleForm(null)}>Record Sale</Button>
            )}
          </div>
          <MerchandiseSalesTable sales={filteredSales} />
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="search"
              value={stockSearch}
              onChange={(event) => setStockSearch(event.target.value)}
              placeholder="Search stock movements…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <MerchandiseStockHistoryTable movements={filteredMovements} />
        </div>
      )}

      {activeTab === 'reports' && (
        <MerchandiseReports products={products} sales={sales} />
      )}

      {canManage && (
        <>
          <MerchandiseForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingProduct}
            customCategories={customCategories}
            customColours={customColours}
          />

          <MerchandiseSaleForm
            isOpen={isSaleOpen}
            onClose={() => {
              setIsSaleOpen(false);
              setSaleProduct(null);
            }}
            onSubmit={handleSaleSubmit}
            product={saleProduct}
            products={products}
          />

          <MerchandiseStockForm
            isOpen={isStockOpen}
            onClose={() => {
              setIsStockOpen(false);
              setStockProduct(null);
            }}
            onSubmit={handleStockSubmit}
            product={stockProduct}
            mode={stockMode}
          />

          <MerchandiseRequestForm
            isOpen={isRequestOpen}
            onClose={() => setIsRequestOpen(false)}
            onSubmit={handleRequestSubmit}
            products={products}
          />

          <MerchandiseDeleteModal
            isOpen={Boolean(deletingProduct)}
            onClose={() => setDeletingProduct(null)}
            onConfirm={handleDelete}
            product={deletingProduct}
            isDeleting={isDeleting}
          />
        </>
      )}

      <MerchandiseViewModal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        sales={sales}
        movements={movements}
        requests={requests}
        canManage={canManage}
        onEdit={openEditForm}
        onDelete={(product) => {
          setViewingProduct(null);
          setDeletingProduct(product);
        }}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onRecordSale={openSaleForm}
        onAddStock={(product) => openStockForm(product, 'add')}
        onRemoveStock={(product) => openStockForm(product, 'remove')}
        onAdjustStock={(product) => openStockForm(product, 'adjust')}
      />
    </div>
  );
}
