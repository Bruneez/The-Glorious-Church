import { useEffect, useState } from 'react';

function getChartLayout(width) {
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  if (isMobile) {
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

  if (isTablet) {
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

export function useChartLayout() {
  const [layout, setLayout] = useState(() =>
    getChartLayout(typeof window !== 'undefined' ? window.innerWidth : 1280),
  );

  useEffect(() => {
    const updateLayout = () => setLayout(getChartLayout(window.innerWidth));

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return layout;
}

export { getChartLayout };
