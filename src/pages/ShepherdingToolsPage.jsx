import { useState } from 'react';
import ShepherdingToolsTabs from '@/components/features/shepherding-tools/ShepherdingToolsTabs';
import ShepherdingToolsTabPanel, {
  ShepherdingToolsToolbar,
} from '@/components/features/shepherding-tools/ShepherdingToolsTabPanel';
import ShepherdingToolsForm from '@/components/features/shepherding-tools/ShepherdingToolsForm';
import ShepherdingToolsViewModal from '@/components/features/shepherding-tools/ShepherdingToolsViewModal';
import ShepherdingToolsDeleteModal from '@/components/features/shepherding-tools/ShepherdingToolsDeleteModal';
import {
  DEFAULT_SHEPHERDING_TOOLS_TAB,
  getShepherdingToolsTabById,
  SHEPHERDING_TOOLS_TABS,
} from '@/config/shepherdingToolsOptions';
import { PUBLISHED_STATUS } from '@/config/shepherdingToolsConstants';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  createResource,
  deleteResource,
  publishResource,
  unpublishResource,
  updateResource,
} from '@/services/shepherdingToolsService';
import { createShepherdingResourcePublishedNotification } from '@/services/notificationService';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const toneClass =
    feedback.type === 'success'
      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      : feedback.type === 'warning'
        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400';

  return (
    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${toneClass}`}
    >
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function ShepherdingToolsPage() {
  const [activeTab, setActiveTab] = useState(DEFAULT_SHEPHERDING_TOOLS_TAB);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [publishedStatusFilter, setPublishedStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [deletingResource, setDeletingResource] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formSessionKey, setFormSessionKey] = useState(0);

  const { firebaseUser, staffProfile } = useAuth();
  const { role, canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_SHEPHERDING_TOOLS');
  const activeTabConfig = getShepherdingToolsTabById(activeTab);

  const createdByUserId = firebaseUser?.uid || '';
  const actorStaffId = staffProfile?.id || '';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPlatformFilter('');
    setPublishedStatusFilter('all');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    resetFilters();
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const maybeSendPublishNotification = async (resource) => {
    if (!resource?.notificationEnabled || resource.publishedStatus !== PUBLISHED_STATUS.PUBLISHED) {
      return;
    }

    try {
      await createShepherdingResourcePublishedNotification({
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceTypeLabel: getShepherdingToolsTabById(resource.resourceType).label,
        excludeStaffId: actorStaffId,
      });
    } catch {
      // Non-blocking notification failure.
    }
  };

  const handleAddResource = () => {
    if (!canManage) return;
    setEditingResource(null);
    setIsFormOpen(true);
  };

  const handleEditResource = (resource) => {
    if (!canManage) return;
    setViewingResource(null);
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleViewResource = (resource) => {
    setViewingResource(resource);
  };

  const handleDeletePrompt = (resource) => {
    if (!canManage) return;
    setViewingResource(null);
    setDeletingResource(resource);
  };

  const handleFormSubmit = async ({ formData, coverFile, removeCover }) => {
    if (!canManage) {
      throw new Error('You do not have permission to manage Shepherding Tools resources.');
    }

    try {
      if (editingResource?.id) {
        const result = await updateResource(editingResource.id, formData, {
          role,
          createdByUserId,
          initialData: editingResource,
          coverFile,
          removeCover,
        });

        if (result.storageWarnings?.length) {
          showFeedback('warning', `Resource updated. ${result.storageWarnings.join(' ')}`);
        } else {
          showFeedback('success', 'Resource updated successfully.');
        }

        await maybeSendPublishNotification({ ...editingResource, ...formData, id: editingResource.id });
      } else {
        const result = await createResource(formData, {
          role,
          createdByUserId,
          coverFile,
        });

        showFeedback('success', 'Resource added successfully.');
        await maybeSendPublishNotification({ ...result.resource, ...formData });
      }

      setIsFormOpen(false);
      setEditingResource(null);
      setFormSessionKey((previous) => previous + 1);
    } catch (error) {
      console.error('Failed to add or update Shepherding Tools resource:', error);
      throw error;
    }
  };

  const handleDeleteConfirm = async (resource) => {
    if (!canManage) return;

    setIsDeleting(true);
    try {
      const result = await deleteResource(resource.id, { role, initialData: resource });

      if (result.storageWarnings?.length) {
        showFeedback('warning', `Resource deleted. ${result.storageWarnings.join(' ')}`);
      } else {
        showFeedback('success', 'Resource deleted successfully.');
      }

      setDeletingResource(null);
    } catch (error) {
      showFeedback('error', error?.message || 'The resource could not be deleted. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (resource) => {
    if (!canManage) return;

    setIsPublishing(true);
    try {
      const result = await publishResource(resource.id, { role, initialData: resource });
      showFeedback('success', 'Resource published successfully.');
      await maybeSendPublishNotification(result.resource);
      setViewingResource(result.resource);
    } catch (error) {
      showFeedback('error', error?.message || 'The resource could not be published. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async (resource) => {
    if (!canManage) return;

    setIsPublishing(true);
    try {
      const result = await unpublishResource(resource.id, { role, initialData: resource });
      showFeedback('success', 'Resource moved to draft.');
      setViewingResource(result.resource);
    } catch (error) {
      showFeedback('error', error?.message || 'The resource could not be unpublished. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="page-root">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-white tracking-wide">Shepherding Tools</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Resources to equip, guide and empower church leaders in ministry.
        </p>
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <div className="mt-4 space-y-4 min-w-0">
        <ShepherdingToolsTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm min-w-0">
          <div className="p-4 space-y-4 min-w-0">
            <ShepherdingToolsToolbar
              tab={activeTabConfig}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              platformFilter={platformFilter}
              onPlatformFilterChange={setPlatformFilter}
              publishedStatusFilter={publishedStatusFilter}
              onPublishedStatusFilterChange={setPublishedStatusFilter}
              canManage={canManage}
              onAdd={handleAddResource}
            />

            {SHEPHERDING_TOOLS_TABS.map((tab) => {
              if (tab.id !== activeTab) return null;

              return (
                <div
                  key={tab.id}
                  id={`shepherding-tools-panel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`shepherding-tools-tab-${tab.id}`}
                  className="min-w-0"
                >
                  <ShepherdingToolsTabPanel
                    tab={tab}
                    searchTerm={searchTerm}
                    categoryFilter={categoryFilter}
                    platformFilter={platformFilter}
                    publishedStatusFilter={publishedStatusFilter}
                    onView={handleViewResource}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {canManage ? (
        <ShepherdingToolsForm
          key={`${formSessionKey}-${activeTab}-${editingResource?.id || 'new'}`}
          resourceType={editingResource?.resourceType || activeTab}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingResource(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingResource}
        />
      ) : null}

      <ShepherdingToolsViewModal
        resource={viewingResource}
        isOpen={Boolean(viewingResource)}
        onClose={() => setViewingResource(null)}
        onEdit={canManage ? handleEditResource : undefined}
        onDelete={canManage ? handleDeletePrompt : undefined}
        onPublish={canManage ? handlePublish : undefined}
        onUnpublish={canManage ? handleUnpublish : undefined}
        canManage={canManage}
        isPublishing={isPublishing}
      />

      {canManage ? (
        <ShepherdingToolsDeleteModal
          resource={deletingResource}
          isOpen={Boolean(deletingResource)}
          onClose={() => setDeletingResource(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      ) : null}
    </div>
  );
}
