export const CHART_COLORS = {
  line: '#818cf8',
  visitors: '#22d3ee',
  salvations: '#34d399',
  grid: '#334155',
  axis: '#64748b',
  axisLabel: '#94a3b8',
  tooltipBg: '#0f172a',
  tooltipBorder: '#475569',
  tooltipText: '#e2e8f0',
};

export const CHART_BAR_COLORS = [
  '#818cf8',
  '#a78bfa',
  '#22d3ee',
  '#34d399',
  '#f472b6',
  '#fb923c',
];

export function getAttendanceBarColor(index = 0) {
  return CHART_BAR_COLORS[index % CHART_BAR_COLORS.length];
}

export const CHART_MARGINS = {
  top: 12,
  right: 12,
  left: 0,
  bottom: 8,
};

export function getResponsiveXAxisProps(layout, label = 'Service Date') {
  return {
    tick: { fill: CHART_COLORS.axis, fontSize: layout.fontSize },
    tickLine: { stroke: CHART_COLORS.grid },
    axisLine: { stroke: CHART_COLORS.grid },
    interval: 'preserveStartEnd',
    minTickGap: layout.isMobile ? 16 : 24,
    angle: layout.xAxisAngle,
    textAnchor: layout.xAxisAngle ? 'end' : 'middle',
    height: layout.xAxisHeight,
    label: {
      value: label,
      position: 'insideBottom',
      offset: layout.isMobile ? -2 : -4,
      fill: CHART_COLORS.axisLabel,
      fontSize: layout.fontSize,
    },
  };
}

export function getResponsiveYAxisProps(layout, label, dataKey) {
  return {
    dataKey,
    allowDecimals: false,
    tick: { fill: CHART_COLORS.axis, fontSize: layout.fontSize },
    tickLine: { stroke: CHART_COLORS.grid },
    axisLine: { stroke: CHART_COLORS.grid },
    width: layout.yAxisWidth,
    label: {
      value: label,
      angle: -90,
      position: 'insideLeft',
      fill: CHART_COLORS.axisLabel,
      fontSize: layout.fontSize,
      style: { textAnchor: 'middle' },
    },
  };
}
