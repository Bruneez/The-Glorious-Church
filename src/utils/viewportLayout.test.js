import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHART_MOBILE_MEDIA_QUERY,
  CHART_TABLET_MEDIA_QUERY,
  DESKTOP_SIDEBAR_MEDIA_QUERY,
  getInitialChartLayoutBucket,
  getInitialDesktopSidebarMatches,
} from './viewportLayout.js';

test('viewport layout defaults safely without browser APIs', () => {
  assert.equal(getInitialChartLayoutBucket(), 'desktop');
  assert.equal(getInitialDesktopSidebarMatches(), false);
});

test('viewport layout exports stable media query constants', () => {
  assert.match(CHART_MOBILE_MEDIA_QUERY, /639px/);
  assert.match(CHART_TABLET_MEDIA_QUERY, /640px/);
  assert.match(CHART_TABLET_MEDIA_QUERY, /1023px/);
  assert.match(DESKTOP_SIDEBAR_MEDIA_QUERY, /1280px/);
});
