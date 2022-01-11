/**
 * @jest-environment jsdom
 */
import RootUI from '../ui.html';
import { UIEventHandler } from '../ui.js';
import { APP_TAG_NAME } from './../components/app/App';

window.document.body.innerHTML = RootUI;

describe('ui', () => {
  test('should have defined', () => {
    expect(document.getElementById('ui')).not.toBeNull();
    expect(document.getElementsByTagName(APP_TAG_NAME)).not.toBeNull();
  });
});

describe('ui event handlers', () => {
  test('', () => {});
});
