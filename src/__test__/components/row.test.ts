/**
 * @jest-environment jsdom
 */
import '../../components/row';

const ELEMENT_NAME = 'feature-flags-row';
describe('feature-flags-row', () => {
  test('should have defined', () => {
    expect(customElements.get(ELEMENT_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const row = document.createElement(ELEMENT_NAME);
    document.body.appendChild(row);
    expect(document.body.querySelector(ELEMENT_NAME)).toBeDefined();
  });

  test('updating attributes', () => {
    const row = document.createElement(ELEMENT_NAME);
    row.setAttribute('name', 'test');
    row.setAttribute('type', 'feature');
    row.setAttribute('key', '1234');
    row.setAttribute('editable', '');
    row.setAttribute('visible', '');
    row.setAttribute('node-type', 'group');

    expect(row.getAttribute('name')).toBe('test');
    expect(row.getAttribute('type')).toBe('feature');
    expect(row.getAttribute('key')).toBe('1234');
    expect(row.getAttribute('editable')).toBe('');
    expect(row.getAttribute('visible')).toBe('');
    expect(row.getAttribute('node-type')).toBe('group');
  });

  test('updating DOM depends on attributes', () => {
    const row = document.createElement(ELEMENT_NAME);
    const root = row.shadowRoot;

    row.setAttribute('name', 'previous name');
    row.setAttribute('type', 'node');
    row.setAttribute('node-type', 'group');

    document.body.appendChild(row);

    // name
    expect(root?.querySelector('#name')?.innerHTML).toBe('previous name');
    row.setAttribute('name', 'new name');
    expect(root?.querySelector('#name')?.innerHTML).toBe('new name');

    // node-type
    expect(root?.querySelector('.group')).toBeDefined();
    row.setAttribute('node-type', 'frame');
    expect(root?.querySelector('.frame')).toBeDefined();

    // editable
    expect(root?.querySelector('.editable')).toBeNull();
    row.setAttribute('editable', '');
    expect(root?.querySelector('.editable')).toBeDefined();

    // visible
    expect(root?.querySelector('.visible')).toBeNull();
    row.setAttribute('visible', '');
    expect(root?.querySelector('.visible')).toBeDefined();
  });
});
