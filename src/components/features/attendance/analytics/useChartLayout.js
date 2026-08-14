import { useEffect, useState } from 'react';
import {
  getInitialChartLayoutBucket,
  subscribeChartLayoutBucket,
} from '../../../../utils/viewportLayout.js';

function getChartLayoutForBucket(bucket) {
  if (bucket === 'mobile') {
    return {
      isMobile: true,
      isTablet: false,
      height: 260,
      xAxisAngle: -35,
      xAxisHeight: 58,
      yAxisWidth: 42,
      fontSize: 10,
      pieOuterRadius: 70,
      pieCenterY: '40%',
      legendLayout: 'vertical',
      legendAlign: 'left',
      legendMaxHeight: 128,
    };
  }

  if (bucket === 'tablet') {
    return {
      isMobile: false,
      isTablet: true,
      height: 280,
      xAxisAngle: -25,
      xAxisHeight: 50,
      yAxisWidth: 46,
      fontSize: 10,
      pieOuterRadius: 80,
      pieCenterY: '43%',
      legendLayout: 'horizontal',
      legendAlign: 'center',
      legendMaxHeight: undefined,
    };
  }

  return {
    isMobile: false,
    isTablet: false,
    height: 280,
    xAxisAngle: 0,
    xAxisHeight: 36,
    yAxisWidth: 48,
    fontSize: 11,
    pieOuterRadius: 88,
    pieCenterY: '45%',
    legendLayout: 'horizontal',
    legendAlign: 'center',
    legendMaxHeight: undefined,
  };
}

/** @deprecated Prefer layout buckets via `getChartLayoutForBucket`. Width mapping remains for tests. */
export function getChartLayout(widthOrBucket) {
  if (widthOrBucket === 'mobile' || widthOrBucket === 'tablet' || widthOrBucket === 'desktop') {
    return getChartLayoutForBucket(widthOrBucket);
  }

  const width = Number(widthOrBucket) || 1280;
  if (width < 640) return getChartLayoutForBucket('mobile');
  if (width < 1024) return getChartLayoutForBucket('tablet');
  return getChartLayoutForBucket('desktop');
}

export function useChartLayout() {
  const [layout, setLayout] = useState(() => getChartLayoutForBucket(getInitialChartLayoutBucket()));

  useEffect(() => subscribeChartLayoutBucket((bucket) => {
    setLayout(getChartLayoutForBucket(bucket));
  }), []);

  return layout;
}

export { getChartLayoutForBucket };
