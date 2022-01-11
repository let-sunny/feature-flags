/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import { TAG_NAMES, EVENTS } from '../../components';

describe(TAG_NAMES.CONTEXT_MENU, () => {
  test('should have defined', () => {
    expect(customElements.get(TAG_NAMES.CONTEXT_MENU)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(TAG_NAMES.CONTEXT_MENU);
    document.body.appendChild(element);
    expect(document.body.querySelector(TAG_NAMES.CONTEXT_MENU)).toBeDefined();
  });
});

describe(`${TAG_NAMES.CONTEXT_MENU} event handlers`, () => {
  const element = document.createElement(TAG_NAMES.CONTEXT_MENU);
  element.id = 'test-context-menu';
  document.body.appendChild(element);

  // set target
  const target = document.createElement(TAG_NAMES.ROW);
  target.id = 'test-row';
  target.setAttribute('name', 'my node');
  target.setAttribute('node-type', 'GROUP');
  target.setAttribute('type', 'NODE');
  target.dispatchEvent = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb());
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });

  test('open ', () => {
    fireEvent(
      element,
      new CustomEvent(EVENTS.OPEN_CONTEXT_MENU, {
        detail: {
          composedPath: jest.fn().mockReturnValue([target]),
          pageX: 10,
          pageY: 20,
        },
      })
    );
    expect(element.style.display).toBe('block');
    expect(element.style.left).toBe('10px');
    expect(element.style.top).toBe('20px');
  });

  test('close', () => {
    fireEvent(element, new CustomEvent(EVENTS.CLOSE_CONTEXT_MENU));
    expect(element.style.display).toBe('none');
  });

  test('rename feature', () => {
    const renameButton = element.shadowRoot?.querySelector(
      '#rename'
    ) as HTMLElement;
    expect(renameButton).toBeDefined();
    fireEvent.click(renameButton);

    const targetEvent = target.dispatchEvent as jest.Mock;
    expect(targetEvent.mock.calls[0][0].type).toBe(EVENTS.REQUEST_RENAME);
  });

  test('delete node/feature', () => {
    element.dispatchEvent = jest.fn();

    const deleteButton = element.shadowRoot?.querySelector(
      '#delete'
    ) as HTMLElement;
    expect(deleteButton).toBeDefined();
    fireEvent.click(deleteButton);

    const contextMenuEvent = element.dispatchEvent as jest.Mock;
    // delete node
    expect(contextMenuEvent.mock.calls[0][0].type).toBe(EVENTS.DELETE_NODE);
    expect(contextMenuEvent.mock.calls[0][0].detail).toEqual({
      id: target.id,
    });
    // delete feature
    target.setAttribute('type', 'FEATURE');
    fireEvent.click(deleteButton);
    expect(contextMenuEvent.mock.calls[1][0].type).toBe(EVENTS.DELETE_FEATURE);
  });
});
