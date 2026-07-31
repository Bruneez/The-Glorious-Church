import {
  Banknote,
  BookOpen,
  Bug,
  Bus,
  Calendar,
  ClipboardCheck,
  FolderKanban,
  UserPlus,
  Users,
  UserCog,
  ListTodo,
} from 'lucide-react';

export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
  MEMBER_ADDED: 'member_added',
  ATTENDANCE_RECORDED: 'attendance_recorded',
  USER_CREATED: 'user_created',
  MEMBER_STATUS_CHANGED: 'member_status_changed',
  EVENT_ADDED: 'event_added',
  TRANSPORT_UPDATED: 'transport_updated',
  OFFERING_RECORDED: 'offering_recorded',
  SHEPHERDING_RESOURCE_PUBLISHED: 'shepherding_resource_published',
  APP_FIX_NEW_REQUEST: 'app_fix_new_request',
  APP_FIX_CRITICAL_REQUEST: 'app_fix_critical_request',
  APP_FIX_REOPENED: 'app_fix_reopened',
  APP_FIX_ADDITIONAL_INFO: 'app_fix_additional_info',
  APP_FIX_STATUS_CHANGED: 'app_fix_status_changed',
  APP_FIX_INFO_REQUESTED: 'app_fix_info_requested',
  APP_FIX_COMPLETED: 'app_fix_completed',
  APP_FIX_REJECTED: 'app_fix_rejected',
  APP_FIX_DUPLICATED: 'app_fix_duplicated',
  PROJECT_JOIN_REQUEST: 'project_join_request',
  PROJECT_JOIN_APPROVED: 'project_join_approved',
  PROJECT_JOIN_REJECTED: 'project_join_rejected',
  PROJECT_LEADER_ASSIGNED: 'project_leader_assigned',
  PROJECT_STATUS_CHANGED: 'project_status_changed',
};

export const NOTIFICATION_ENTITY_TYPE = {
  TASK: 'task',
  MEMBER: 'member',
  ATTENDANCE: 'attendance',
  USER: 'user',
  EVENT: 'event',
  TRANSPORT: 'transport',
  OFFERING: 'offering',
  SHEPHERDING_RESOURCE: 'shepherding_resource',
  APP_FIX_REQUEST: 'app_fix_request',
  PROJECT: 'project',
};

export const NOTIFICATION_SCOPE = {
  SYSTEM: 'system',
  DEPARTMENT: 'department',
};

export const NOTIFICATION_TYPE_META = {
  [NOTIFICATION_TYPE.TASK_ASSIGNED]: {
    icon: ListTodo,
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  [NOTIFICATION_TYPE.MEMBER_ADDED]: {
    icon: UserPlus,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  [NOTIFICATION_TYPE.ATTENDANCE_RECORDED]: {
    icon: ClipboardCheck,
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  [NOTIFICATION_TYPE.USER_CREATED]: {
    icon: UserCog,
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  [NOTIFICATION_TYPE.MEMBER_STATUS_CHANGED]: {
    icon: Users,
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  [NOTIFICATION_TYPE.EVENT_ADDED]: {
    icon: Calendar,
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  [NOTIFICATION_TYPE.TRANSPORT_UPDATED]: {
    icon: Bus,
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  [NOTIFICATION_TYPE.OFFERING_RECORDED]: {
    icon: Banknote,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  [NOTIFICATION_TYPE.SHEPHERDING_RESOURCE_PUBLISHED]: {
    icon: BookOpen,
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_NEW_REQUEST]: {
    icon: Bug,
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_CRITICAL_REQUEST]: {
    icon: Bug,
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_REOPENED]: {
    icon: Bug,
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_ADDITIONAL_INFO]: {
    icon: Bug,
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_STATUS_CHANGED]: {
    icon: Bug,
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_INFO_REQUESTED]: {
    icon: Bug,
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_COMPLETED]: {
    icon: Bug,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_REJECTED]: {
    icon: Bug,
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  [NOTIFICATION_TYPE.APP_FIX_DUPLICATED]: {
    icon: Bug,
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  [NOTIFICATION_TYPE.PROJECT_JOIN_REQUEST]: {
    icon: FolderKanban,
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  [NOTIFICATION_TYPE.PROJECT_JOIN_APPROVED]: {
    icon: FolderKanban,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  [NOTIFICATION_TYPE.PROJECT_JOIN_REJECTED]: {
    icon: FolderKanban,
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  [NOTIFICATION_TYPE.PROJECT_LEADER_ASSIGNED]: {
    icon: FolderKanban,
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  [NOTIFICATION_TYPE.PROJECT_STATUS_CHANGED]: {
    icon: FolderKanban,
    accent: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
};

export const NOTIFICATION_LIMIT = 10;
