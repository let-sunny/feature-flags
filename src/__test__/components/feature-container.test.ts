/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import FeatureContainer, {
  CONTAINER_TAG_NAME,
} from './../../components/feature-container/FeatureContainer';
import { ROW_TAG_NAME } from './../../components/row/Row';
import emitter from './../../event/emitter';

FeatureContainer.prototype.emitter = emitter;
customElements.define(CONTAINER_TAG_NAME, FeatureContainer);
describe(CONTAINER_TAG_NAME, () => {
  test('should have defined', () => {
    expect(customElements.get(CONTAINER_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(CONTAINER_TAG_NAME)).toBeDefined();
  });

  test('initial closed attribute is true', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    document.body.appendChild(element);

    expect(element.getAttribute('closed')).toBe('true');
  });
});

describe(`${CONTAINER_TAG_NAME} event handlers`, () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb());
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });

  test('should toggle closed attribute', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    element.id = 'test-container';
    element.setAttribute('closed', 'true');

    document.body.appendChild(element);

    const button = element.shadowRoot?.querySelector('.toggle') as HTMLElement;
    fireEvent.click(button);
    expect(element.getAttribute('closed')).toBe('false');
  });

  test('should request toggle feature visibility', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    element.id = 'test-container';
    element.setAttribute('visible', 'false');
    document.body.appendChild(element);

    const button = element.shadowRoot?.querySelector(
      '#toggle-visible'
    ) as HTMLElement;

    const mock = jest.fn();
    emitter.on('changeFeatureVisible', mock);

    fireEvent.click(button);

    expect(mock).toBeCalled();
    expect(mock.mock.calls[0][0].id).toBe(element.id);
    emitter.off('changeFeatureVisible', mock);
  });

  test('should request add node', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    element.id = 'test-container';
    document.body.appendChild(element);

    const button = element.shadowRoot?.querySelector(
      '#add-node'
    ) as HTMLElement;

    const mock = jest.fn();
    emitter.on('addSelectedNodesToFeature', mock);
    fireEvent.click(button);

    expect(mock).toBeCalled();
    expect(mock.mock.calls[0][0].id).toBe(element.id);
    emitter.off('addSelectedNodesToFeature', mock);
  });

  test('should focus item', () => {
    const element = document.createElement(CONTAINER_TAG_NAME);
    element.id = 'test-container';
    document.body.appendChild(element);

    const target = document.createElement(ROW_TAG_NAME);
    target.id = 'test-row';
    target.setAttribute('type', 'FEATURE');
    element.appendChild(target);
    element.dispatchEvent = jest.fn();

    fireEvent.click(target, {
      composed: true,
    });

    emitter.emit('focus', {
      id: element.id,
      parentId: element.id,
      type: 'FEATURE',
    });

    expect(element.shadowRoot?.querySelector('.focus')).toBeDefined();
  });
});
