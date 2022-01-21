/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import Row, { ROW_TAG_NAME } from './../../components/row/Row';
import emitter from './../../event/emitter';

Row.prototype.emitter = emitter;
customElements.define(ROW_TAG_NAME, Row);
describe(ROW_TAG_NAME, () => {
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

describe(`${ROW_TAG_NAME} event handlers`, () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb());
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });

  test('request rename', () => {
    const element = document.createElement(ROW_TAG_NAME);
    element.id = 'test-row';
    element.setAttribute('name', 'previous name');

    document.body.appendChild(element);

    const mock = jest.fn();
    emitter.on('renameFeature', mock);
    emitter.emit('editFeatureName', { id: element.id });

    const input = element.shadowRoot?.querySelector(
      '.input'
    ) as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.style.display).toBe('block');
    expect(input.value).toBe('previous name');
    input.value = 'new name';

    // submit
    fireEvent.blur(input);

    expect(mock).toBeCalled();
    expect(mock.mock.calls[0][0].id).toBe(element.id);
    expect(mock.mock.calls[0][0].name).toBe(input.value);
    emitter.off('renameFeature', mock);
  });
});
