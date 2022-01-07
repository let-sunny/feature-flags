/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import '../../components/collapsible-list';

const ELEMENT_NAME = 'feature-flags-list';
describe(ELEMENT_NAME, () => {
  test('should have defined', () => {
    expect(customElements.get(ELEMENT_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const list = document.createElement(ELEMENT_NAME);
    document.body.appendChild(list);
    expect(document.body.querySelector(ELEMENT_NAME)).toBeDefined();
  });

  test('firing an event to toggle collapsible content', () => {
    const list = document.createElement(ELEMENT_NAME);
    expect(list.shadowRoot?.querySelector('.closed')).toBeDefined();

    const header = list.shadowRoot?.querySelector('#header');
    expect(header).toBeDefined();
    if (header) {
      fireEvent(header, new MouseEvent('click'));
      expect(list.shadowRoot?.querySelector('.closed')).toBeNull();
    }
  });
});
