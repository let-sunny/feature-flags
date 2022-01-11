/**
 * @jest-environment jsdom
 */
import App, { APP_TAG_NAME } from '../../components/app/App';

describe(APP_TAG_NAME, () => {
  customElements.define(APP_TAG_NAME, App);

  test('should have defined', () => {
    expect(customElements.get(APP_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(APP_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(APP_TAG_NAME)).toBeDefined();
  });
});
