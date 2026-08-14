/** Matches Tailwind `xl` — persistent sidebar begins at this width. */
export const DESKTOP_SIDEBAR_MEDIA_QUERY = '(min-width: 1280px)';

export const CHART_MOBILE_MEDIA_QUERY = '(max-width: 639px)';
export const CHART_TABLET_MEDIA_QUERY = '(min-width: 640px) and (max-width: 1023px)';

const desktopSidebarListeners = new Set();
const chartLayoutListeners = new Set();

let initialized = false;
let desktopSidebarMatches = false;
let chartLayoutBucket = 'desktop';

function resolveChartLayoutBucket() {
  if (typeof window === 'undefined') return 'desktop';

  if (window.matchMedia(CHART_MOBILE_MEDIA_QUERY).matches) return 'mobile';
  if (window.matchMedia(CHART_TABLET_MEDIA_QUERY).matches) return 'tablet';
  return 'desktop';
}

function notifyDesktopSidebarListeners() {
  desktopSidebarListeners.forEach((listener) => {
    listener(desktopSidebarMatches);
  });
}

function notifyChartLayoutListeners() {
  chartLayoutListeners.forEach((listener) => {
    listener(chartLayoutBucket);
  });
}

function syncDesktopSidebar(matches) {
  desktopSidebarMatches = matches;
  notifyDesktopSidebarListeners();
}

function syncChartLayoutBucket() {
  const nextBucket = resolveChartLayoutBucket();
  if (nextBucket === chartLayoutBucket) return;
  chartLayoutBucket = nextBucket;
  notifyChartLayoutListeners();
}

export function initViewportLayoutListeners() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const desktopMediaQuery = window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY);
  const mobileMediaQuery = window.matchMedia(CHART_MOBILE_MEDIA_QUERY);
  const tabletMediaQuery = window.matchMedia(CHART_TABLET_MEDIA_QUERY);

  desktopSidebarMatches = desktopMediaQuery.matches;
  chartLayoutBucket = resolveChartLayoutBucket();

  desktopMediaQuery.addEventListener('change', (event) => {
    syncDesktopSidebar(event.matches);
  });

  const handleChartLayoutChange = () => {
    syncChartLayoutBucket();
  };

  mobileMediaQuery.addEventListener('change', handleChartLayoutChange);
  tabletMediaQuery.addEventListener('change', handleChartLayoutChange);
}

export function getDesktopSidebarMatches() {
  initViewportLayoutListeners();
  return desktopSidebarMatches;
}

export function subscribeDesktopSidebar(listener) {
  initViewportLayoutListeners();
  desktopSidebarListeners.add(listener);
  listener(desktopSidebarMatches);
  return () => desktopSidebarListeners.delete(listener);
}

export function getChartLayoutBucket() {
  initViewportLayoutListeners();
  return chartLayoutBucket;
}

export function subscribeChartLayoutBucket(listener) {
  initViewportLayoutListeners();
  chartLayoutListeners.add(listener);
  listener(chartLayoutBucket);
  return () => chartLayoutListeners.delete(listener);
}

export function getInitialDesktopSidebarMatches() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY).matches;
}

export function getInitialChartLayoutBucket() {
  if (typeof window === 'undefined') return 'desktop';
  return resolveChartLayoutBucket();
}
