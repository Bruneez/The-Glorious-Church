import { MAP_MARKER_TYPES } from '../config/mapOptions.js';

const MARKER_STYLES = {
  [MAP_MARKER_TYPES.MEMBER]: {
    size: 36,
    borderRadius: '9999px',
    background: '#4f46e5',
    fontSize: '11px',
  },
  [MAP_MARKER_TYPES.MEMBER_WORK]: {
    size: 36,
    borderRadius: '9999px',
    background: '#d97706',
    fontSize: '11px',
  },
  [MAP_MARKER_TYPES.SCHOOL]: {
    size: 36,
    borderRadius: '9999px',
    background: '#0ea5e9',
    fontSize: '10px',
  },
  [MAP_MARKER_TYPES.BRANCH]: {
    size: 38,
    borderRadius: '9999px',
    background: '#10b981',
    fontSize: '16px',
  },
  [MAP_MARKER_TYPES.MINISTRY]: {
    size: 36,
    borderRadius: '12px',
    background: '#f59e0b',
    fontSize: '12px',
  },
  [MAP_MARKER_TYPES.CREATIVE_ARTS]: {
    size: 36,
    borderRadius: '9999px',
    background: '#ec4899',
    fontSize: '14px',
  },
};

export function buildMarkerImageContent(url, borderRadius, fallbackLabel = '') {
  const safeUrl = String(url).replace(/"/g, '&quot;');

  if (!fallbackLabel) {
    return `<img src="${safeUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:${borderRadius};" />`;
  }

  const safeFallback = String(fallbackLabel)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');

  return `<img src="${safeUrl}" alt="" onerror="this.onerror=null;this.outerHTML='${safeFallback}';" style="width:100%;height:100%;object-fit:cover;border-radius:${borderRadius};" />`;
}

export function resolveMapMarkerInnerContent(marker) {
  const style = MARKER_STYLES[marker.type] || MARKER_STYLES[MAP_MARKER_TYPES.MEMBER];
  const label = marker.label || '•';
  const photo = marker.data?.photo;
  const logo = marker.data?.logo;
  const isMemberHome = marker.type === MAP_MARKER_TYPES.MEMBER;
  const isMemberWork = marker.type === MAP_MARKER_TYPES.MEMBER_WORK;
  const isSchool = marker.type === MAP_MARKER_TYPES.SCHOOL;

  let innerContent = label;
  let useLightBackground = false;

  if (isMemberHome && photo) {
    innerContent = buildMarkerImageContent(photo, style.borderRadius);
    useLightBackground = true;
  } else if (isMemberWork) {
    innerContent = '💼';
  } else if (isSchool && logo) {
    innerContent = buildMarkerImageContent(logo, style.borderRadius, label);
    useLightBackground = true;
  }

  return {
    innerContent,
    useLightBackground,
    style,
    label,
  };
}
