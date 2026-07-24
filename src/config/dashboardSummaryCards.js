import { formatCurrencySimple } from '../utils/formatters.js';
import { isElderRole, isLeader } from './roles.js';

export const DASHBOARD_SUMMARY_CARD_IDS = {
  TOTAL_MEMBERS: 'totalMembers',
  TOTAL_OFFERINGS: 'totalOfferings',
  AVERAGE_ATTENDANCE: 'averageAttendance',
  TOTAL_SCHOOLS: 'totalSchools',
  TOTAL_MINISTRIES: 'totalMinistries',
};

export function usesMinistryDashboardStat(role) {
  return isElderRole(role) || isLeader(role);
}

export function getDashboardSummaryCardIdsForRole(role) {
  const secondCard = usesMinistryDashboardStat(role)
    ? DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MINISTRIES
    : DASHBOARD_SUMMARY_CARD_IDS.TOTAL_OFFERINGS;

  return [
    DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MEMBERS,
    secondCard,
    DASHBOARD_SUMMARY_CARD_IDS.AVERAGE_ATTENDANCE,
    DASHBOARD_SUMMARY_CARD_IDS.TOTAL_SCHOOLS,
  ];
}

export function buildDashboardSummaryCards({
  role,
  membersCount = 0,
  membersLoading = false,
  offeringsTotal = 0,
  offeringsLoading = false,
  attendanceAverage = 0,
  attendanceLoading = false,
  schoolsCount = 0,
  schoolsLoading = false,
  ministriesCount = 0,
  ministriesLoading = false,
} = {}) {
  const cardCatalog = {
    [DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MEMBERS]: {
      label: 'Total Members',
      value: membersCount,
      loading: membersLoading,
    },
    [DASHBOARD_SUMMARY_CARD_IDS.TOTAL_OFFERINGS]: {
      label: 'Total Offerings',
      value: formatCurrencySimple(offeringsTotal),
      loading: offeringsLoading,
    },
    [DASHBOARD_SUMMARY_CARD_IDS.AVERAGE_ATTENDANCE]: {
      label: 'Average Attendance',
      value: attendanceAverage,
      loading: attendanceLoading,
    },
    [DASHBOARD_SUMMARY_CARD_IDS.TOTAL_SCHOOLS]: {
      label: 'Total Schools',
      value: schoolsCount,
      loading: schoolsLoading,
    },
    [DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MINISTRIES]: {
      label: 'Total Ministries',
      value: ministriesCount,
      loading: ministriesLoading,
    },
  };

  return getDashboardSummaryCardIdsForRole(role).map((id) => ({
    id,
    ...cardCatalog[id],
  }));
}
