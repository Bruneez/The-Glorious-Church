import {
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  Users,
  Palette,
  Church,
  School,
  Map,
  CalendarCheck,
  Banknote,
  Bus,
  Calendar,
  ClipboardList,
  KanbanSquare,
  ListTodo,
  Plane,
  Clapperboard,
} from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: null },
  { path: '/blueprint', label: 'Blueprint', icon: BookOpen, roles: null },
  { path: '/users', label: 'System Users', icon: ShieldCheck, roles: null },
  { path: '/members', label: 'Members Directory', icon: Users, roles: null },
  { path: '/creative-arts', label: 'Creative Arts', icon: Palette, roles: null },
  { path: '/ministries', label: 'Ministries', icon: Church, roles: null },
  { path: '/schools', label: 'Schools', icon: School, roles: null },
  { path: '/map', label: 'Map', icon: Map, roles: null },
  { path: '/attendance', label: 'Attendance Tracker', icon: CalendarCheck, roles: null },
  { path: '/offerings', label: 'Offerings Log', icon: Banknote, roles: null },
  { path: '/transport', label: 'Saturday Transport', icon: Bus, roles: null },
  { path: '/travelling', label: 'Travelling', icon: Plane, roles: null },
  { path: '/machaneh-movies', label: 'Machaneh Movies', icon: Clapperboard, roles: null },
  { path: '/calendar', label: 'Calendar', icon: Calendar, roles: null },
  { path: '/service-program', label: 'Service Program', icon: ClipboardList, roles: null },
  { path: '/tasks', label: 'Tasks', icon: ListTodo, roles: null },
  { path: '/development-board', label: 'Development Board', icon: KanbanSquare, roles: null },
];

import { canAccessRoute } from './permissions';

export function getNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => canAccessRoute(role, item.path));
}

export const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/blueprint': 'Blueprint',
  '/users': 'System Users',
  '/members': 'Members Directory',
  '/creative-arts': 'Creative Arts',
  '/ministries': 'Ministries',
  '/schools': 'Schools',
  '/map': 'Map',
  '/attendance': 'Attendance Tracker',
  '/offerings': 'Offerings Log',
  '/transport': 'Saturday Transport',
  '/travelling': 'Travelling',
  '/machaneh-movies': 'Machaneh Movies',
  '/calendar': 'Calendar',
  '/service-program': 'Service Program',
  '/development-board': 'Development Board',
  '/tasks': 'Tasks',
};
