/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/dom';
import { Feature, Node } from './../../components/types';
import App, { APP_TAG_NAME } from './../../components/app/App';
import emitter from './../../event/emitter';

App.prototype.emitter = emitter;
customElements.define(APP_TAG_NAME, App);

describe(APP_TAG_NAME, () => {
  test('should have defined', () => {
    expect(customElements.get(APP_TAG_NAME)).toBeDefined();
  });

  test('appending to DOM', () => {
    const element = document.createElement(APP_TAG_NAME);
    document.body.appendChild(element);
    expect(document.body.querySelector(APP_TAG_NAME)).toBeDefined();
  });
});

describe(`${APP_TAG_NAME} event handlers`, () => {
  let features: Feature[] = [];
  let selection: Node[] = [];
  beforeEach(() => {
    features = [
      {
        id: '1',
        name: 'feature 1',
        type: 'FEATURE',
        visible: true,
        items: [],
      },
      {
        id: '2',
        name: 'feature 2',
        type: 'FEATURE',
        visible: true,
        items: [
          {
            id: '2.1',
            name: 'Node 2.1',
            type: 'NODE',
            visible: true,
            node: 'GROUP',
          },
        ],
      },
    ];
    selection = [
      {
        id: '3.1',
        name: 'Node 3.1',
        type: 'NODE',
        visible: true,
        node: 'GROUP',
      },
    ];
  });

  test('onSetSelectionNodes ', () => {
    const element = document.createElement(APP_TAG_NAME);
    element.id = 'test-app';
    document.body.appendChild(element);

    const nodes = [
      {
        id: '1',
        name: 'node 1',
        type: 'NODE' as const,
        node: 'GROUP',
        visible: true,
        focused: {},
      },
      {
        id: '2',
        name: 'node 2',
        type: 'NODE' as const,
        node: 'GROUP',
        visible: true,
        focused: {},
      },
    ];

    emitter.emit('setSelectionNodes', { nodes });
    expect(JSON.parse(element.getAttribute('selection') || '{}')).toEqual(
      nodes
    );
  });

  test('onDeleteNode', () => {
    const element = document.createElement(APP_TAG_NAME);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    const detail = features[1].items[0];
    emitter.emit('deleteItem', { id: detail.id, type: detail.type });

    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
      {
        ...features[1],
        items: [],
      },
    ]);
  });

  test('onAddNodes', () => {
    const element = document.createElement(APP_TAG_NAME);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    element.setAttribute('selection', JSON.stringify(selection));

    document.body.appendChild(element);

    emitter.emit('addSelectedNodesToFeature', { id: '2' });
    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
      {
        ...features[1],
        items: [
          ...features[1].items,
          ...JSON.parse(element.getAttribute('selection') || '{}'),
        ],
      },
    ]);
  });

  test('onCreateFeature', () => {
    const element = document.createElement(APP_TAG_NAME);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    const button = element.shadowRoot?.querySelector(
      '#add-feature'
    ) as HTMLElement;
    fireEvent.click(button);
    expect(JSON.parse(element.getAttribute('features') || '{}').length).toBe(
      features.length + 1
    );
  });

  test('onDeleteFeature', () => {
    const element = document.createElement(APP_TAG_NAME);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    emitter.emit('deleteItem', { id: features[1].id, type: features[1].type });

    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
    ]);
  });

  test('onRenameFeature', () => {
    const element = document.createElement(APP_TAG_NAME);
    element.id = 'test-app';
    element.setAttribute('features', JSON.stringify(features));
    document.body.appendChild(element);

    emitter.emit('renameFeature', {
      id: '2',
      name: 'feature 2 renamed',
    });
    expect(JSON.parse(element.getAttribute('features') || '{}')).toEqual([
      features[0],
      {
        ...features[1],
        name: 'feature 2 renamed',
      },
    ]);
  });
});
