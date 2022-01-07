/**
 * @jest-environment jsdom
 */
import '../../components/context-menu';

const ELEMENT_NAME = 'feature-flags-context-menu';
describe(ELEMENT_NAME, () => {
  test('should have defined', () => {
    expect(customElements.get(ELEMENT_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(ELEMENT_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(ELEMENT_NAME)).toBeDefined();
  });

  test('updating style depends on attributes', () => {
    const element = document.createElement(ELEMENT_NAME);
    const root = element.shadowRoot;
    document.body.appendChild(element);

    const containerStyle = root?.getElementById('container')?.style;

    containerStyle?.setProperty('left', '100px');
    containerStyle?.setProperty('top', '100px');

    element.setAttribute('x', '185');
    expect(containerStyle?.getPropertyValue('left')).toBe('185px');
    element.setAttribute('y', '36');
    expect(containerStyle?.getPropertyValue('top')).toBe('36px');

    expect(root?.querySelector('.hidden')).toBeDefined();
    element.setAttribute('for', '1234');
    expect(root?.querySelector('.hidden')).toBeNull();
  });
});
