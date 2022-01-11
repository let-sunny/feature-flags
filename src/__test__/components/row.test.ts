/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import { EVENTS, TAG_NAMES } from './../../components/index';

describe(TAG_NAMES.ROW, () => {
  test('should have defined', () => {
    expect(customElements.get(TAG_NAMES.ROW)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(TAG_NAMES.ROW);
    document.body.appendChild(element);
    expect(document.body.querySelector(TAG_NAMES.ROW)).toBeDefined();
  });

  test('updating DOM depends on attributes', () => {
    const element = document.createElement(TAG_NAMES.ROW);
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

describe(`${TAG_NAMES.ROW} event handlers`, () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb());
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });

  test('request rename', () => {
    const element = document.createElement(TAG_NAMES.ROW);
    element.id = 'test-row';
    element.setAttribute('name', 'previous name');

    document.body.appendChild(element);

    fireEvent(element, new CustomEvent(EVENTS.REQUEST_RENAME));

    const input = element.shadowRoot?.querySelector(
      '.input'
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.style.display).toBe('block');
    expect(input.value).toBe('previous name');
    input.value = 'new name';

    element.dispatchEvent = jest.fn();
    const rowEvent = element.dispatchEvent as jest.Mock;
    // submit
    fireEvent.blur(input);

    expect(rowEvent).toHaveBeenCalled();

    expect(rowEvent.mock.calls[0][0].type).toBe(EVENTS.RENAME_FEATURE);
    expect(rowEvent.mock.calls[0][0].detail).toEqual({
      id: 'test-row',
      name: 'new name',
    });
  });
});
