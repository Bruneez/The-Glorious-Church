export const TASK_STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
};

export const KANBAN_COLUMNS = [
  { status: TASK_STATUS.OPEN, label: 'New Tasks' },
  { status: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { status: TASK_STATUS.TESTING, label: 'Testing' },
  { status: TASK_STATUS.COMPLETED, label: 'Completed' },
];

export const TASK_STATUSES = KANBAN_COLUMNS.map((column) => column.status);

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

export const STATUS_OPTIONS = KANBAN_COLUMNS.map((column) => ({
  value: column.status,
  label: column.label,
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

export function getTaskStatusLabel(status) {
  if (status === TASK_STATUS.ASSIGNED) {
    return 'New Tasks';
  }

  const column = KANBAN_COLUMNS.find((entry) => entry.status === status);
  return column?.label || status || '—';
}

export function getTaskBoardStatus(status) {
  if (status === TASK_STATUS.ASSIGNED) {
    return TASK_STATUS.OPEN;
  }

  return status || TASK_STATUS.OPEN;
}

export function taskBelongsToColumn(task, columnStatus) {
  const taskStatus = task?.status || TASK_STATUS.OPEN;

  if (columnStatus === TASK_STATUS.OPEN) {
    return taskStatus === TASK_STATUS.OPEN || taskStatus === TASK_STATUS.ASSIGNED;
  }

  return taskStatus === columnStatus;
}

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
  return KANBAN_COLUMNS.reduce((groups, column) => {
    groups[column.status] = tasks.filter((task) => taskBelongsToColumn(task, column.status));
    return groups;
  }, {});
}

export function getPriorityBadgeClass(priority) {
  return PRIORITY_BADGE_CLASSES[priority] || PRIORITY_BADGE_CLASSES[TASK_PRIORITY.MEDIUM];
}
