import { useMemo } from 'react';
import { Calendar, Palette } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/services/membersService';
import { useOfferings } from '@/services/offeringsService';
import { useAttendance } from '@/services/attendanceService';
import { useSchoolsDirectory } from '@/services/schoolsService';
import { useEvents } from '@/services/calendarService';
import { computeOfferingStats } from '@/config/offeringsOptions';
import { computeAttendanceStats } from '@/config/attendanceOptions';
import {
  getUpcomingEventsAndBirthdays,
  computeCreativeArtsOverview,
} from '@/config/dashboardOptions';
import { formatCurrencySimple, formatDate, formatTime } from '@/utils/formatters';

function getFirstName(staffProfile, firebaseUser) {
  const fullName = (staffProfile?.name || firebaseUser?.displayName || '').trim();
  if (!fullName) return 'User';
  return fullName.split(/\s+/)[0];
}

function formatTodayDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function SummaryCard({ label, value, loading }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
        <h3 className="text-2xl md:text-3xl font-bold mt-1 text-indigo-400">
          {loading ? '—' : value}
        </h3>
      </div>
    </div>
  );
}

function PanelShell({ title, icon: Icon, loading, isEmpty, emptyMessage, children }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm h-full">
      <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
        <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : isEmpty ? (
        <div className="p-8 text-center">
          <p className="text-slate-500 text-xs">{emptyMessage}</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">{children}</div>
      )}
    </div>
  );
}

function ItemTypeBadge({ type }) {
  const isBirthday = type === 'Birthday';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
        isBirthday
          ? 'bg-pink-950/60 text-pink-400 border border-pink-500/20'
          : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/20'
      }`}
    >
      {type}
    </span>
  );
}

export default function DashboardPage() {
  const { staffProfile, firebaseUser } = useAuth();
  const { data: members = [], loading: membersLoading } = useMembers();
  const { data: offerings = [], loading: offeringsLoading } = useOfferings();
  const { data: attendanceRecords = [], loading: attendanceLoading } = useAttendance();
  const { data: schools = [], loading: schoolsLoading } = useSchoolsDirectory();
  const { data: events = [], loading: eventsLoading } = useEvents();

  const firstName = useMemo(
    () => getFirstName(staffProfile, firebaseUser),
    [staffProfile, firebaseUser],
  );

  const todayDate = useMemo(() => formatTodayDate(), []);

  const offeringStats = useMemo(
    () => computeOfferingStats(offerings),
    [offerings],
  );

  const attendanceStats = useMemo(
    () => computeAttendanceStats(attendanceRecords),
    [attendanceRecords],
  );

  const upcomingItems = useMemo(
    () => getUpcomingEventsAndBirthdays(events, members, 5),
    [events, members],
  );

  const creativeArtsOverview = useMemo(
    () => computeCreativeArtsOverview(members),
    [members],
  );

  const upcomingLoading = eventsLoading || membersLoading;

  const summaryCards = [
    {
      label: 'Total Members',
      value: members.length,
      loading: membersLoading,
    },
    {
      label: 'Total Offerings',
      value: formatCurrencySimple(offeringStats.total),
      loading: offeringsLoading,
    },
    {
      label: 'Average Attendance',
      value: attendanceStats.average,
      loading: attendanceLoading,
    },
    {
      label: 'Total Schools',
      value: schools.length,
      loading: schoolsLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-5 md:p-6 shadow-sm">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide leading-snug">
          <span aria-hidden="true" className="mr-2">👋</span>
          Welcome back,{' '}
          <span className="text-indigo-400">{firstName}</span>!
        </h1>
        <p className="text-sm md:text-base text-slate-300 mt-2 font-medium">
          The Glorious Church Management System
        </p>
        <p className="text-xs sm:text-sm text-indigo-300/90 mt-3 font-semibold tracking-wide">
          {todayDate}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            loading={card.loading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelShell
          title="Upcoming Events & Birthdays"
          icon={Calendar}
          loading={upcomingLoading}
          isEmpty={upcomingItems.length === 0}
          emptyMessage="No upcoming events or birthdays."
        >
          {upcomingItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg p-3 border bg-slate-900/50 transition ${
                item.type === 'Birthday'
                  ? 'border-slate-700/50 hover:border-pink-500/30'
                  : 'border-slate-700/50 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                    <ItemTypeBadge type={item.type} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{formatDate(item.date)}</span>
                    {item.time && <span>• {formatTime(item.time)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </PanelShell>

        <PanelShell
          title="Creative Arts Overview"
          icon={Palette}
          loading={membersLoading}
          isEmpty={false}
          emptyMessage=""
        >
          {creativeArtsOverview.map((department) => (
            <div
              key={department.name}
              className="rounded-lg p-3 border bg-slate-900/50 border-slate-700/50 hover:border-indigo-500/30 transition flex items-center justify-between gap-3"
            >
              <h3 className="text-sm font-semibold text-white">{department.name}</h3>
              <span className="text-sm font-bold text-indigo-400 shrink-0">
                {department.memberCount}
              </span>
            </div>
          ))}
        </PanelShell>
      </div>
    </div>
  );
}
