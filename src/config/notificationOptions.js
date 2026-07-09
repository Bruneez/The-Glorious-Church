import {
  Banknote,
  Bus,
  Calendar,
  ClipboardCheck,
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
};

export const NOTIFICATION_ENTITY_TYPE = {
  TASK: 'task',
  MEMBER: 'member',
  ATTENDANCE: 'attendance',
  USER: 'user',
  EVENT: 'event',
  TRANSPORT: 'transport',
  OFFERING: 'offering',
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
};

export const NOTIFICATION_LIMIT = 10;
