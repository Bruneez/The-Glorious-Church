import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Palette,
  School,
  GraduationCap,
  Building2,
  Map,
  MapPin,
  CalendarCheck,
  Banknote,
  Bus,
  Calendar,
} from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: null },
  { path: '/users', label: 'System Users', icon: ShieldCheck, roles: ['Admin', 'Pastor'] },
  { path: '/members', label: 'Members Directory', icon: Users, roles: null },
  { path: '/creative-arts', label: 'Creative Arts', icon: Palette, roles: null },
  { path: '/schools/primary', label: 'Primary Schools', icon: School, roles: null },
  { path: '/schools/high', label: 'High Schools', icon: GraduationCap, roles: null },
  { path: '/schools/higher-education', label: 'Universities & Colleges', icon: Building2, roles: null },
  { path: '/maps/members', label: 'Members Map', icon: Map, roles: null },
  { path: '/maps/schools', label: 'High Schools Map', icon: MapPin, roles: null },
  { path: '/attendance', label: 'Attendance Tracker', icon: CalendarCheck, roles: null },
  { path: '/offerings', label: 'Offerings Log', icon: Banknote, roles: null },
  { path: '/transport', label: 'Saturday Transport', icon: Bus, roles: ['Admin', 'Pastor'] },
  { path: '/calendar', label: 'Calendar', icon: Calendar, roles: null },
];

export function getNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });
}

export const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/users': 'System Users',
  '/members': 'Members Directory',
  '/creative-arts': 'Creative Arts',
  '/schools/primary': 'Primary Schools',
  '/schools/high': 'High Schools',
  '/schools/higher-education': 'Universities & Colleges',
  '/maps/members': 'Members Map',
  '/maps/schools': 'High Schools Map',
  '/attendance': 'Attendance Tracker',
  '/offerings': 'Offerings Log',
  '/transport': 'Saturday Transport',
  '/calendar': 'Calendar',
};
