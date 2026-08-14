import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOpenModalCount,
  hasOpenModals,
  isTopModal,
  registerModal,
  resetModalStackForTests,
} from './modalStack.js';

test('registerModal tracks topmost modal for escape handling', () => {
  resetModalStackForTests();

  const unregisterFirst = registerModal('first');
  const unregisterSecond = registerModal('second');

  assert.equal(getOpenModalCount(), 2);
  assert.equal(isTopModal('first'), false);
  assert.equal(isTopModal('second'), true);
  assert.equal(hasOpenModals(), true);

  unregisterSecond();
  assert.equal(isTopModal('first'), true);

  unregisterFirst();
  assert.equal(hasOpenModals(), false);
});

test('registerModal cleanup removes only the matching registration', () => {
  resetModalStackForTests();

  registerModal('a');
  const unregisterB = registerModal('b');
  unregisterB();

  assert.equal(getOpenModalCount(), 1);
  assert.equal(isTopModal('a'), true);
  resetModalStackForTests();
});
