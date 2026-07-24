import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDashboardSummaryCards,
  DASHBOARD_SUMMARY_CARD_IDS,
  getDashboardSummaryCardIdsForRole,
  usesMinistryDashboardStat,
} from './dashboardSummaryCards.js';
import { ROLES } from './roles.js';

test('operational roles keep Total Offerings on the dashboard', () => {
  [ROLES.LEAD_PASTOR, ROLES.PASTOR, ROLES.ADMIN].forEach((role) => {
    assert.equal(usesMinistryDashboardStat(role), false);
    assert.deepEqual(getDashboardSummaryCardIdsForRole(role), [
      DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MEMBERS,
      DASHBOARD_SUMMARY_CARD_IDS.TOTAL_OFFERINGS,
      DASHBOARD_SUMMARY_CARD_IDS.AVERAGE_ATTENDANCE,
      DASHBOARD_SUMMARY_CARD_IDS.TOTAL_SCHOOLS,
    ]);
  });
});

test('Elder and Leader replace Total Offerings with Total Ministries', () => {
  [ROLES.ELDER, ROLES.LEADER].forEach((role) => {
    assert.equal(usesMinistryDashboardStat(role), true);
    assert.deepEqual(getDashboardSummaryCardIdsForRole(role), [
      DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MEMBERS,
      DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MINISTRIES,
      DASHBOARD_SUMMARY_CARD_IDS.AVERAGE_ATTENDANCE,
      DASHBOARD_SUMMARY_CARD_IDS.TOTAL_SCHOOLS,
    ]);
  });
});

test('buildDashboardSummaryCards formats offerings for operational roles', () => {
  const cards = buildDashboardSummaryCards({
    role: ROLES.ADMIN,
    membersCount: 120,
    offeringsTotal: 1500,
    attendanceAverage: 85,
    schoolsCount: 6,
  });

  assert.equal(cards.length, 4);
  assert.equal(cards[1].id, DASHBOARD_SUMMARY_CARD_IDS.TOTAL_OFFERINGS);
  assert.equal(cards[1].label, 'Total Offerings');
  assert.match(cards[1].value, /1[\s\u00a0]?500/);
});

test('buildDashboardSummaryCards shows ministry count for Elder and Leader', () => {
  const cards = buildDashboardSummaryCards({
    role: ROLES.ELDER,
    membersCount: 120,
    ministriesCount: 12,
    attendanceAverage: 85,
    schoolsCount: 6,
  });

  assert.equal(cards.length, 4);
  assert.equal(cards[1].id, DASHBOARD_SUMMARY_CARD_IDS.TOTAL_MINISTRIES);
  assert.equal(cards[1].label, 'Total Ministries');
  assert.equal(cards[1].value, 12);
  assert.equal(cards.some((card) => card.id === DASHBOARD_SUMMARY_CARD_IDS.TOTAL_OFFERINGS), false);
});
