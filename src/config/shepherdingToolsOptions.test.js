import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SHEPHERDING_TOOLS_TAB,
  getShepherdingToolsTabById,
  SHEPHERDING_TOOLS_TABS,
  SHEPHERDING_TOOLS_TAB_IDS,
} from './shepherdingToolsOptions.js';

test('SHEPHERDING_TOOLS_TABS defines five resource sections with empty states', () => {
  assert.equal(SHEPHERDING_TOOLS_TABS.length, 5);
  assert.equal(SHEPHERDING_TOOLS_TABS[0].id, SHEPHERDING_TOOLS_TAB_IDS.AUDIO_SERMONS);
  assert.match(SHEPHERDING_TOOLS_TABS[0].emptyMessage, /audio sermons/i);
  assert.match(
    SHEPHERDING_TOOLS_TABS.find((tab) => tab.id === SHEPHERDING_TOOLS_TAB_IDS.DAILY_DEVOTIONALS).emptyMessage,
    /devotionals/i,
  );
});

test('getShepherdingToolsTabById falls back to the default tab', () => {
  assert.equal(getShepherdingToolsTabById('unknown').id, DEFAULT_SHEPHERDING_TOOLS_TAB);
  assert.equal(getShepherdingToolsTabById(SHEPHERDING_TOOLS_TAB_IDS.BOOKS).label, 'Books');
});
