/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import { EVENTS, TAG_NAMES } from '../../components';

describe(TAG_NAMES.CONTAINER, () => {
  test('should have defined', () => {
    expect(customElements.get(TAG_NAMES.CONTAINER)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(TAG_NAMES.CONTAINER);
    document.body.appendChild(element);
    expect(document.body.querySelector(TAG_NAMES.CONTAINER)).toBeDefined();
  });

  test('initial closed attribute is true', () => {
    const element = document.createElement(TAG_NAMES.CONTAINER);
    document.body.appendChild(element);

    expect(element.getAttribute('closed')).toBe('true');
  });
});

describe(`${TAG_NAMES.CONTAINER} event handlers`, () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb());
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });

  test('should toggle closed attribute', () => {
    const element = document.createElement(TAG_NAMES.CONTAINER);
    element.id = 'test-container';
    element.setAttribute('closed', 'true');

    document.body.appendChild(element);

    const button = element.shadowRoot?.querySelector('.toggle') as HTMLElement;
    fireEvent.click(button);
    expect(element.getAttribute('closed')).toBe('false');
  });

  test('should request toggle feature visibility', () => {
    const element = document.createElement(TAG_NAMES.CONTAINER);
    element.id = 'test-container';
    element.setAttribute('visible', 'false');
    document.body.appendChild(element);

    element.dispatchEvent = jest.fn();
    const button = element.shadowRoot?.querySelector(
      '#toggle-visible'
    ) as HTMLElement;
    fireEvent.click(button);

    const elementEvent = element.dispatchEvent as jest.Mock;
    expect(elementEvent.mock.calls[0][0].type).toBe(EVENTS.CHANGE_VISIBLE);
    expect(elementEvent.mock.calls[0][0].detail).toEqual({
      id: element.id,
      visible: element.getAttribute('visible') !== 'true',
    });
  });

  test('should request add node', () => {
    const element = document.createElement(TAG_NAMES.CONTAINER);
    element.id = 'test-container';
    document.body.appendChild(element);

    element.dispatchEvent = jest.fn();
    const button = element.shadowRoot?.querySelector(
      '#add-node'
    ) as HTMLElement;
    fireEvent.click(button);

    const elementEvent = element.dispatchEvent as jest.Mock;
    expect(elementEvent.mock.calls[0][0].type).toBe(EVENTS.ADD_NODES);
    expect(elementEvent.mock.calls[0][0].detail).toEqual({
      featureId: element.id,
    });
  });

  test('should request focus', () => {
    const element = document.createElement(TAG_NAMES.CONTAINER);
    element.id = 'test-container';
    document.body.appendChild(element);

    const target = document.createElement(TAG_NAMES.ROW);
    target.id = 'test-row';
    target.setAttribute('type', 'FEATURE');
    element.appendChild(target);
    element.dispatchEvent = jest.fn();

    fireEvent.click(target, {
      composed: true,
    });

    const elementEvent = element.dispatchEvent as jest.Mock;
    expect(elementEvent.mock.calls[0][0].type).toBe(EVENTS.FOCUS);
    expect(elementEvent.mock.calls[0][0].detail).toEqual({
      id: target.id,
      parentId: element.id,
      type: target.getAttribute('type'),
    });
  });
});
