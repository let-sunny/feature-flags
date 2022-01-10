/**
 * @jest-environment jsdom
 */
import Row, { ROW_TAG_NAME } from './../../components/row/Row';

describe(ROW_TAG_NAME, () => {
  customElements.define(ROW_TAG_NAME, Row);

  test('should have defined', () => {
    expect(customElements.get(ROW_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(ROW_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(ROW_TAG_NAME)).toBeDefined();
  });

  test('updating DOM depends on attributes', () => {
    const element = document.createElement(ROW_TAG_NAME);
    const root = element.shadowRoot;

    element.setAttribute('name', 'previous name');
    element.setAttribute('type', 'NODE');
    element.setAttribute('node-type', 'GROUP');

    // name
    expect(root?.querySelector('.name')?.innerHTML).toBe('previous name');
    element.setAttribute('name', 'new name');
    expect(root?.querySelector('.name')?.innerHTML).toBe('new name');

    // node-type
    expect(root?.querySelector('.group')).toBeDefined();
    element.setAttribute('node-type', 'frame');
    expect(root?.querySelector('.frame')).toBeDefined();
  });
});
