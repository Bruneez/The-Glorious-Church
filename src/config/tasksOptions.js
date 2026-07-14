import { getRoleLabel } from './roles';

export const TASK_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

export const TASK_STATUSES = [
  TASK_STATUS.OPEN,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
  TASK_STATUS.ARCHIVED,
];

export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const TASK_PRIORITIES = [
  TASK_PRIORITY.LOW,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.CRITICAL,
];

export const STATUS_OPTIONS = TASK_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

export const PRIORITY_OPTIONS = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: priority,
}));

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  ...PRIORITY_OPTIONS,
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...STATUS_OPTIONS,
];

export const DUE_DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Due Dates' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due Today' },
  { value: 'week', label: 'Due This Week' },
  { value: 'none', label: 'No Due Date' },
];

export function isTasksModuleEligibleStaff(member) {
  if (member?.status === 'Inactive') return false;
  if (member?.taskModuleEnabled === false) return false;
  return true;
}

function filterTasksEligibleStaff(staff = []) {
  return staff.filter(isTasksModuleEligibleStaff);
}

export function getTasksModuleExcludedStaff(staff = []) {
  return staff
    .filter((member) => member?.taskModuleEnabled === false)
    .sort((left, right) => {
      const nameA = (left.fullName || left.name || '').toLowerCase();
      const nameB = (right.fullName || right.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
}

export function buildAssigneeFilterOptions(staff = []) {
  const eligibleStaff = filterTasksEligibleStaff(staff);

  return [
    { value: 'all', label: 'All Users' },
    { value: 'unassigned', label: 'Unassigned' },
    ...eligibleStaff.map((member) => ({
      value: member.id,
      label: member.fullName || member.name || 'Unknown',
    })),
  ];
}

export function filterTasks(
  tasks = [],
  {
    searchTerm = '',
    assignedUserId = 'all',
    status = 'all',
    priority = 'all',
    dueDate = 'all',
  } = {},
) {
  let filtered = [...tasks];

  if (assignedUserId && assignedUserId !== 'all') {
    if (assignedUserId === 'unassigned') {
      filtered = filtered.filter((task) => !task.assignedUserId);
    } else {
      filtered = filtered.filter((task) => task.assignedUserId === assignedUserId);
    }
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((task) => task.status === status);
  }

  if (priority && priority !== 'all') {
    filtered = filtered.filter((task) => task.priority === priority);
  }

  if (dueDate && dueDate !== 'all') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter((task) => {
      if (dueDate === 'none') {
        return !task.dueDate;
      }

      if (!task.dueDate) {
        return false;
      }

      const taskDue = new Date(task.dueDate);
      if (Number.isNaN(taskDue.getTime())) {
        return false;
      }

      taskDue.setHours(0, 0, 0, 0);

      if (dueDate === 'overdue') {
        return taskDue < today && task.status !== TASK_STATUS.COMPLETED;
      }

      if (dueDate === 'today') {
        return taskDue.getTime() === today.getTime();
      }

      if (dueDate === 'week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return taskDue >= today && taskDue <= weekEnd;
      }

      return task.dueDate === dueDate;
    });
  }

  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title?.toLowerCase().includes(term) ||
        task.assignedUserName?.toLowerCase().includes(term),
    );
  }

  return filtered;
}

export const PRIORITY_BADGE_CLASSES = {
  [TASK_PRIORITY.CRITICAL]: 'bg-rose-950/60 text-rose-400 border-rose-500/20',
  [TASK_PRIORITY.HIGH]: 'bg-amber-950/60 text-amber-400 border-amber-500/20',
  [TASK_PRIORITY.MEDIUM]: 'bg-indigo-950/60 text-indigo-400 border-indigo-500/20',
  [TASK_PRIORITY.LOW]: 'bg-slate-800 text-slate-400 border-slate-600/40',
};

export const STATUS_BADGE_CLASSES = {
  [TASK_STATUS.OPEN]: 'bg-sky-950/60 text-sky-400 border-sky-500/20',
  [TASK_STATUS.IN_PROGRESS]: 'bg-amber-950/60 text-amber-400 border-amber-500/20',
  [TASK_STATUS.COMPLETED]: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20',
  [TASK_STATUS.ARCHIVED]: 'bg-slate-800 text-slate-400 border-slate-600/40',
};

export function isActiveTaskStatus(status) {
  return status === TASK_STATUS.OPEN || status === TASK_STATUS.IN_PROGRESS;
}

export function getActiveTasksForAssignee(tasks = []) {
  return tasks.filter((task) => isActiveTaskStatus(task.status));
}

export function buildTaskPayload(taskData = {}) {
  return {
    title: String(taskData.title || '').trim(),
    description: String(taskData.description || '').trim(),
    assignedUserId: String(taskData.assignedUserId || '').trim(),
    assignedUserName: String(taskData.assignedUserName || '').trim(),
    assignedUserRole: String(taskData.assignedUserRole || '').trim(),
    priority: taskData.priority || TASK_PRIORITY.MEDIUM,
    status: taskData.status || TASK_STATUS.OPEN,
    dueDate: String(taskData.dueDate || '').trim(),
  };
}

export function isTaskOverdue(task) {
  if (!task?.dueDate || task.status === TASK_STATUS.COMPLETED || task.status === TASK_STATUS.ARCHIVED) {
    return false;
  }

  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

export function getTaskSummaryStats(tasks = []) {
  const open = tasks.filter((task) => task.status === TASK_STATUS.OPEN).length;
  const inProgress = tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length;
  const completed = tasks.filter((task) => task.status === TASK_STATUS.COMPLETED).length;
  const overdue = tasks.filter((task) => isTaskOverdue(task)).length;

  return {
    total: tasks.length,
    open,
    inProgress,
    completed,
    overdue,
  };
}

export function getTaskSummaryCards(tasks = []) {
  const stats = getTaskSummaryStats(tasks);

  return [
    { key: 'total', label: 'Total Tasks', value: stats.total },
    { key: 'open', label: 'Open Tasks', value: stats.open },
    { key: 'inProgress', label: 'In Progress', value: stats.inProgress },
    { key: 'completed', label: 'Completed', value: stats.completed },
    { key: 'overdue', label: 'Overdue Tasks', value: stats.overdue, highlight: stats.overdue > 0 },
  ];
}

export function getPriorityBadgeClass(priority) {
  return PRIORITY_BADGE_CLASSES[priority] || PRIORITY_BADGE_CLASSES[TASK_PRIORITY.MEDIUM];
}

export function getStatusBadgeClass(status) {
  return STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES[TASK_STATUS.OPEN];
}

function normalizeAssigneeName(value) {
  return String(value || '').trim().toLowerCase();
}

export function isTaskAssignedToCurrentUser(
  task,
  { staffDocId = '', staffProfile = null, firebaseUser = null } = {},
) {
  if (!task) return false;

  const currentUserId = String(staffDocId || firebaseUser?.uid || '').trim();
  if (currentUserId && task.assignedUserId === currentUserId) {
    return true;
  }

  const currentName = normalizeAssigneeName(
    staffProfile?.fullName || staffProfile?.name || firebaseUser?.displayName,
  );
  const assignedName = normalizeAssigneeName(task.assignedUserName);

  return Boolean(currentName && assignedName && currentName === assignedName);
}

export function filterTasksForCurrentUser(
  tasks = [],
  userContext = {},
  { canViewAll = false } = {},
) {
  if (canViewAll) return tasks;
  return tasks.filter((task) => isTaskAssignedToCurrentUser(task, userContext));
}

export function buildStaffAssigneeOptions(staff = []) {
  const eligibleStaff = filterTasksEligibleStaff(staff);

  return [
    { value: '', label: 'Unassigned' },
    ...eligibleStaff.map((member) => ({
      value: member.id,
      label: `${member.fullName || member.name || 'Unknown'} (${getRoleLabel(member.role) || 'Staff'})`,
      name: member.fullName || member.name || '',
      role: member.role || '',
    })),
  ];
}

export function canViewAssigneeTasks(
  assignee,
  { staffDocId = '', firebaseUser = null } = {},
  { canViewAll = false } = {},
) {
  if (canViewAll) return true;
  if (!assignee) return false;

  const currentUserId = String(staffDocId || firebaseUser?.uid || '').trim();
  if (!currentUserId) return false;

  return assignee.userId === currentUserId;
}

export function buildStaffWorkloadOverview(staff = [], tasks = [], searchTerm = '') {
  const eligibleStaff = filterTasksEligibleStaff(staff);
  const term = searchTerm.trim().toLowerCase();

  const groups = eligibleStaff.map((member) => {
    const userTasks = tasks.filter((task) => task.assignedUserId === member.id);
    const total = userTasks.length;
    const completed = userTasks.filter((task) => task.status === TASK_STATUS.COMPLETED).length;
    const outstanding = userTasks.filter((task) => isActiveTaskStatus(task.status)).length;

    return {
      key: member.id,
      userId: member.id,
      name: member.fullName || member.name || 'Unknown',
      role: member.role || '',
      photo: member.photo || '',
      tasks: userTasks,
      total,
      completed,
      outstanding,
    };
  });

  const unassignedTasks = tasks.filter((task) => !task.assignedUserId);
  if (unassignedTasks.length > 0) {
    const completed = unassignedTasks.filter((task) => task.status === TASK_STATUS.COMPLETED).length;
    const outstanding = unassignedTasks.filter((task) => isActiveTaskStatus(task.status)).length;

    groups.push({
      key: 'unassigned',
      userId: '',
      name: 'Unassigned',
      role: '',
      photo: '',
      tasks: unassignedTasks,
      total: unassignedTasks.length,
      completed,
      outstanding,
    });
  }

  const sortedGroups = groups.sort((left, right) => {
    if (left.key === 'unassigned') return 1;
    if (right.key === 'unassigned') return -1;
    return left.name.localeCompare(right.name);
  });

  if (!term) {
    return sortedGroups;
  }

  return sortedGroups.filter((group) => {
    const nameMatches = group.name.toLowerCase().includes(term);
    const taskMatches = group.tasks.some((task) => task.title?.toLowerCase().includes(term));
    return nameMatches || taskMatches;
  });
}

function getAssigneeKey(task) {
  if (task.assignedUserId) return task.assignedUserId;
  if (task.assignedUserName) return `name:${task.assignedUserName.toLowerCase()}`;
  return 'unassigned';
}

export function groupTasksByAssignedUser(tasks = [], staff = []) {
  const staffById = new Map(staff.map((member) => [member.id, member]));
  const groups = new Map();

  tasks.forEach((task) => {
    const key = getAssigneeKey(task);
    const staffMember = task.assignedUserId ? staffById.get(task.assignedUserId) : null;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        userId: task.assignedUserId || '',
        name:
          task.assignedUserName ||
          staffMember?.fullName ||
          staffMember?.name ||
          'Unassigned',
        role: task.assignedUserRole || staffMember?.role || '',
        photo: staffMember?.photo || '',
        tasks: [],
      });
    }

    groups.get(key).tasks.push(task);
  });

  return Array.from(groups.values())
    .map((group) => {
      const total = group.tasks.length;
      const completed = group.tasks.filter((task) => task.status === TASK_STATUS.COMPLETED).length;

      return {
        ...group,
        total,
        completed,
        outstanding: total - completed,
      };
    })
    .sort((a, b) => {
      if (a.key === 'unassigned') return 1;
      if (b.key === 'unassigned') return -1;
      return a.name.localeCompare(b.name);
    });
}
