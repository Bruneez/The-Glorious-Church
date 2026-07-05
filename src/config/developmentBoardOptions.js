export const TASK_STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
};

export const TASK_STATUSES = [
  TASK_STATUS.OPEN,
  TASK_STATUS.ASSIGNED,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.TESTING,
  TASK_STATUS.COMPLETED,
];

export const TASK_PRIORITY = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const TASK_PRIORITIES = [
  TASK_PRIORITY.CRITICAL,
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.LOW,
];

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  ...TASK_PRIORITIES.map((priority) => ({ value: priority, label: priority })),
];

export const STATUS_OPTIONS = TASK_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

export const PRIORITY_OPTIONS = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: priority,
}));

export const PRIORITY_BADGE_CLASSES = {
  [TASK_PRIORITY.CRITICAL]: 'bg-rose-950/60 text-rose-400 border-rose-500/20',
  [TASK_PRIORITY.HIGH]: 'bg-amber-950/60 text-amber-400 border-amber-500/20',
  [TASK_PRIORITY.MEDIUM]: 'bg-indigo-950/60 text-indigo-400 border-indigo-500/20',
  [TASK_PRIORITY.LOW]: 'bg-slate-800 text-slate-400 border-slate-600/40',
};

/**
 * Reserved for future expansion — do not persist until implemented:
 * comments, attachments, dueDate, labels, activityHistory,
 * estimatedHours, releaseVersion, notificationSent, lastNotifiedAt
 */
export const FUTURE_TASK_FIELDS = [
  'comments',
  'attachments',
  'dueDate',
  'labels',
  'activityHistory',
  'estimatedHours',
  'releaseVersion',
];

export function buildTaskPayload(taskData = {}) {
  return {
    title: String(taskData.title || '').trim(),
    description: String(taskData.description || '').trim(),
    priority: taskData.priority || TASK_PRIORITY.MEDIUM,
    assignedTo: String(taskData.assignedTo || '').trim(),
    requestedBy: String(taskData.requestedBy || '').trim(),
    status: taskData.status || TASK_STATUS.OPEN,
  };
}

export function filterDevelopmentTasks(tasks = [], { searchTerm = '', priority = 'all' } = {}) {
  let filtered = [...tasks];

  if (priority && priority !== 'all') {
    filtered = filtered.filter((task) => task.priority === priority);
  }

  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term),
    );
  }

  return filtered;
}

export function groupTasksByStatus(tasks = []) {
  return TASK_STATUSES.reduce((groups, status) => {
    groups[status] = tasks.filter((task) => task.status === status);
    return groups;
  }, {});
}

export function getPriorityBadgeClass(priority) {
  return PRIORITY_BADGE_CLASSES[priority] || PRIORITY_BADGE_CLASSES[TASK_PRIORITY.MEDIUM];
}
