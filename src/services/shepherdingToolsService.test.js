import test from 'node:test';
import assert from 'node:assert/strict';
import { PUBLISHED_STATUS, SHEPHERDING_RESOURCE_TYPES } from '../config/shepherdingToolsConstants.js';
import {
  getShepherdingToolsQueryConstraints,
  normalizeShepherdingToolsResources,
  sortShepherdingToolsResources,
} from './shepherdingToolsQueryUtils.js';

test('getShepherdingToolsQueryConstraints uses a single resourceType filter for tab queries', () => {
  const constraints = getShepherdingToolsQueryConstraints({
    resourceType: SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL,
  });

  assert.equal(constraints.length, 1);
});

test('normalizeShepherdingToolsResources hides drafts from read-only roles and sorts by updatedAt', () => {
  const resources = normalizeShepherdingToolsResources(
    [
      {
        id: 'published',
        resourceType: SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL,
        title: 'Published',
        publishedStatus: PUBLISHED_STATUS.PUBLISHED,
        updatedAt: '2026-06-10T00:00:00.000Z',
      },
      {
        id: 'draft',
        resourceType: SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL,
        title: 'Draft',
        publishedStatus: PUBLISHED_STATUS.DRAFT,
        updatedAt: '2026-06-12T00:00:00.000Z',
      },
    ],
    'Pastor',
  );

  assert.deepEqual(resources.map((resource) => resource.id), ['published']);
});

test('sortShepherdingToolsResources orders newest updatedAt first', () => {
  const sorted = sortShepherdingToolsResources([
    { id: 'older', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'newer', updatedAt: '2026-06-12T00:00:00.000Z' },
  ]);

  assert.deepEqual(sorted.map((resource) => resource.id), ['newer', 'older']);
});
