/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import ContextMenu, {
  CONTEXT_MENU_TAG_NAME,
} from './../../components/context-menu/ContextMenu';
import { ROW_TAG_NAME } from '../../components/row/Row';
import emitter from './../../event/emitter';

ContextMenu.prototype.emitter = emitter;
customElements.define(CONTEXT_MENU_TAG_NAME, ContextMenu);

describe(CONTEXT_MENU_TAG_NAME, () => {
  test('should have defined', () => {
    expect(customElements.get(CONTEXT_MENU_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(CONTEXT_MENU_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(CONTEXT_MENU_TAG_NAME)).toBeDefined();
  });
});

describe(`${CONTEXT_MENU_TAG_NAME} event handlers`, () => {
  const element = document.createElement(CONTEXT_MENU_TAG_NAME);
  element.id = 'test-context-menu';
  document.body.appendChild(element);

  // set target
  const target = document.createElement(ROW_TAG_NAME);
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
    emitter.emit('openContextMenu', {
      target,
      position: {
        x: 10,
        y: 20,
      },
    });
    expect(element.style.display).toBe('block');
    expect(element.style.left).toBe('10px');
    expect(element.style.top).toBe('20px');
  });

  test('close', () => {
    emitter.emit('closeContextMenu');
    expect(element.style.display).toBe('none');
  });

  test('rename feature', () => {
    const renameButton = element.shadowRoot?.querySelector(
      '#rename'
    ) as HTMLElement;
    expect(renameButton).toBeDefined();

    const mock = jest.fn();
    emitter.on('editFeatureName', mock);
    fireEvent.click(renameButton);

    expect(mock).toHaveBeenCalled();
    emitter.off('editFeatureName', mock);
  });

  test('delete node/feature', () => {
    const deleteButton = element.shadowRoot?.querySelector(
      '#delete'
    ) as HTMLElement;
    expect(deleteButton).toBeDefined();

    const mock = jest.fn();
    emitter.on('deleteItem', mock);
    fireEvent.click(deleteButton);

    // delete
    expect(mock).toHaveBeenCalled();
    expect(mock.mock.calls[0][0].id).toBe(target.id);
    expect(mock.mock.calls[0][0].type).toBe(target.getAttribute('type'));
    emitter.off('deleteItem', mock);
  });
});
