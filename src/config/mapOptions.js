export const MAP_LAYER_IDS = {
  MEMBERS: 'members',
  PRIMARY_SCHOOLS: 'primary-schools',
  HIGH_SCHOOLS: 'high-schools',
  UNIVERSITIES: 'universities',
  BRANCHES: 'branches',
  CREATIVE_ARTS: 'creative-arts',
  MINISTRIES: 'ministries',
};

export const MAP_MARKER_TYPES = {
  MEMBER: 'member',
  SCHOOL: 'school',
  BRANCH: 'branch',
  MINISTRY: 'ministry',
  CREATIVE_ARTS: 'creative-arts',
};

export const MAP_LAYERS = [
  {
    id: MAP_LAYER_IDS.MEMBERS,
    label: 'Members',
    markerType: MAP_MARKER_TYPES.MEMBER,
    color: '#4f46e5',
  },
  {
    id: MAP_LAYER_IDS.PRIMARY_SCHOOLS,
    label: 'Primary Schools',
    markerType: MAP_MARKER_TYPES.SCHOOL,
    color: '#0ea5e9',
  },
  {
    id: MAP_LAYER_IDS.HIGH_SCHOOLS,
    label: 'High Schools',
    markerType: MAP_MARKER_TYPES.SCHOOL,
    color: '#0284c7',
  },
  {
    id: MAP_LAYER_IDS.UNIVERSITIES,
    label: 'Universities & Colleges',
    markerType: MAP_MARKER_TYPES.SCHOOL,
    color: '#0369a1',
  },
  {
    id: MAP_LAYER_IDS.BRANCHES,
    label: 'Branches',
    markerType: MAP_MARKER_TYPES.BRANCH,
    color: '#10b981',
  },
  {
    id: MAP_LAYER_IDS.CREATIVE_ARTS,
    label: 'Creative Arts',
    markerType: MAP_MARKER_TYPES.CREATIVE_ARTS,
    color: '#ec4899',
  },
  {
    id: MAP_LAYER_IDS.MINISTRIES,
    label: 'Ministries',
    markerType: MAP_MARKER_TYPES.MINISTRY,
    color: '#f59e0b',
  },
];

export function createDefaultActiveLayers() {
  return MAP_LAYERS.reduce((layers, layer) => {
    layers[layer.id] = true;
    return layers;
  }, {});
}

export function filterMarkersByActiveLayers(markers = [], activeLayers = {}) {
  return markers.filter((marker) => activeLayers[marker.layerId]);
}
