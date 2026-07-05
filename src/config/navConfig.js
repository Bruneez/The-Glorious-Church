import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Palette,
  School,
  Map,
  MapPin,
  CalendarCheck,
  Banknote,
  Bus,
  Calendar,
  KanbanSquare,
} from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: null },
  { path: '/users', label: 'System Users', icon: ShieldCheck, roles: null },
  { path: '/members', label: 'Members Directory', icon: Users, roles: null },
  { path: '/creative-arts', label: 'Creative Arts', icon: Palette, roles: null },
  { path: '/schools', label: 'Schools', icon: School, roles: null },
  { path: '/maps/members', label: 'Members Map', icon: Map, roles: null },
  { path: '/maps/schools', label: 'High Schools Map', icon: MapPin, roles: null },
  { path: '/attendance', label: 'Attendance Tracker', icon: CalendarCheck, roles: null },
  { path: '/offerings', label: 'Offerings Log', icon: Banknote, roles: null },
  { path: '/transport', label: 'Saturday Transport', icon: Bus, roles: null },
  { path: '/calendar', label: 'Calendar', icon: Calendar, roles: null },
  { path: '/development-board', label: 'Development Board', icon: KanbanSquare, roles: null },
];

import { canAccessRoute } from './permissions';

export function getNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => canAccessRoute(role, item.path));
}

export const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/users': 'System Users',
  '/members': 'Members Directory',
  '/creative-arts': 'Creative Arts',
  '/schools': 'Schools',
  '/maps/members': 'Members Map',
  '/maps/schools': 'High Schools Map',
  '/attendance': 'Attendance Tracker',
  '/offerings': 'Offerings Log',
  '/transport': 'Saturday Transport',
  '/calendar': 'Calendar',
  '/development-board': 'Development Board',
};
